from enum import Enum, auto
from pathlib import Path
from tkinter import Tk
from tkinter import filedialog
from typing import Optional, Dict, Any, List, Type

import eel
import numpy as np
import pandas as pd
from pandas import DataFrame as Data
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, AffinityPropagation, MeanShift
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler, OneHotEncoder

from backend.file_service import FileService
from backend.singleton import Singleton


class DataEditOperationType(Enum):
    ADD_ROW = 0
    REMOVE_ROW = auto()
    ADD_COLUMN = auto()
    REMOVE_COLUMN = auto()
    RENAME_ROW = auto()
    RENAME_COLUMN = auto()
    MODIFY_VALUE = auto()


class NumericalNormalizationType(Enum):
    MIN_MAX = 0
    STANDARDIZATION = auto()


class CategoricalNormalizationType(Enum):
    LABEL = 0
    ONE_HOT = auto()


class ClusterizationMethodType(Enum):
    K_MEANS = 0
    DBSCAN = auto()
    AGGLOMERATIVE = auto()
    GAUSSIAN = auto()
    AFFINITY = auto()
    MEAN_SHIFT = auto()


class DataService(Singleton):
    _data: Optional[Data] = None

    @classmethod
    def data(cls) -> Optional[Data]:
        return cls._data

    @classmethod
    def load(cls, data_path: Path|str) -> Data:
        cls._data = FileService.load(data_path)
        return cls._data

    @classmethod
    def save(cls, data_path: Optional[Path|str] = None) -> None:
        FileService.save(cls._data, data_path)

    @classmethod
    def modify(cls, edit_type: DataEditOperationType, *args, **kwargs) -> None:
        match edit_type:
            case DataEditOperationType.ADD_ROW:
                cls.add_rows(*args, **kwargs)
            case DataEditOperationType.REMOVE_ROW:
                cls.remove_rows(*args, **kwargs)
            case DataEditOperationType.ADD_COLUMN:
                cls.add_columns(*args, **kwargs)
            case DataEditOperationType.REMOVE_COLUMN:
                cls.remove_columns(*args, **kwargs)
            case DataEditOperationType.RENAME_ROW:
                cls.rename_row(*args, **kwargs)
            case DataEditOperationType.RENAME_COLUMN:
                cls.rename_column(*args, **kwargs)
            case DataEditOperationType.MODIFY_VALUE:
                cls.modify_value_at(*args, **kwargs)
            case _:
                raise ValueError('Invalid edit type value.')

    @classmethod
    def add_rows(cls, rows: Dict[int|str, Any]) -> None:
        for row_name, values in rows.items():
            cls._data.loc[row_name] = values

    @classmethod
    def remove_rows(cls, row_identifiers: List[int|str]|int|str) -> None:
        if isinstance(row_identifiers, (int, str)):
            row_identifiers = [row_identifiers]
        cls._data = cls._data.drop(index=row_identifiers)

    @classmethod
    def add_columns(cls, columns: Dict[str, Any]) -> None:
        for column_name, data in columns.items():
            cls._data[column_name] = [None for _ in range(cls._data.shape[0])] if data is None or data == [] else data

    @classmethod
    def remove_columns(cls, columns: List[str]|str) -> None:
        if isinstance(columns, str):
            columns = [columns]
        cls._data = cls._data.drop(columns=columns)

    @classmethod
    def rename_row(cls, row_identifier: int|str, new_name: str) -> None:
        cls._data = cls._data.rename(index={row_identifier: new_name})

    @classmethod
    def rename_column(cls, old_name: str, new_name: str) -> None:
        cls._data = cls._data.rename(columns={old_name: new_name})

    @classmethod
    def modify_value_at(cls, row: str|int, column_name: str, new_value: Any) -> None:
        cls._data.at[row, column_name] = new_value

    @staticmethod
    def get_file_path() -> str:
        root: Tk = Tk()
        root.filename = filedialog.askopenfilename(initialdir="/", title="Select file", filetypes=[("CSV files", "*.csv")])
        root.destroy()
        return root.filename

    @classmethod
    def normalize_numerical(cls, columns: List[str], method: NumericalNormalizationType = NumericalNormalizationType.MIN_MAX) -> None:
        match method:
            case NumericalNormalizationType.MIN_MAX:
                scaler: MinMaxScaler = MinMaxScaler()
            case NumericalNormalizationType.STANDARDIZATION:
                scaler: StandardScaler = StandardScaler()
            case _:
                raise ValueError('Invalid numerical normalization type value.')

        cls._data[columns] = scaler.fit_transform(cls._data[columns])

    @classmethod
    def normalize_categorical(cls, columns: List[str], method: CategoricalNormalizationType = CategoricalNormalizationType.LABEL) -> None:
        match method:
            case CategoricalNormalizationType.LABEL:
                encoder: LabelEncoder = LabelEncoder()
            case CategoricalNormalizationType.ONE_HOT:
                encoder: OneHotEncoder = OneHotEncoder()
            case _:
                raise ValueError('Invalid categorical normalization type value.')

        for column in columns:
            cls._data[column] = encoder.fit_transform(cls._data[column])

    @classmethod
    def normalize(cls, columns: Optional[List[str]] = None,
                  numerical_method: NumericalNormalizationType = NumericalNormalizationType.MIN_MAX,
                  categorical_method: CategoricalNormalizationType = CategoricalNormalizationType.LABEL) -> None:
        if columns is None:
            columns = cls._data.columns

        numerical_columns: List[pd.Index] = cls._data.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns: List[pd.Index] = cls._data.select_dtypes(include=[object]).columns.tolist()    ## Dla wersji poniżej 1.23.5 np.object

        numerical_to_normalize: List[str] = list(set(columns) & set(numerical_columns))
        categorical_to_normalize: List[str] = list(set(columns) & set(categorical_columns))

        if numerical_to_normalize:
            cls.normalize_numerical(numerical_to_normalize, numerical_method)
        if categorical_to_normalize:
            cls.normalize_categorical(categorical_to_normalize, categorical_method)

    @classmethod
    def clusterize(cls, columns: List[str], clusterizationMethod: ClusterizationMethodType, *args, **kwargs) -> np.ndarray:
        if columns is None:
            columns = cls._data.columns
        match clusterizationMethod:
            case ClusterizationMethodType.K_MEANS:
                clusters = cls.clusterize_k_means(columns, *args, **kwargs)
            case ClusterizationMethodType.DBSCAN:
                clusters = cls.clusterize_density(columns, *args, **kwargs)
            case ClusterizationMethodType.AGGLOMERATIVE:
                clusters = cls.clusterize_agglomerative(columns, *args, **kwargs)
            case ClusterizationMethodType.GAUSSIAN:
                clusters = cls.clusterize_gaussian_mixture(columns, *args, **kwargs)
            case ClusterizationMethodType.AFFINITY:
                clusters = cls.clusterize_affinity_propagation(columns, *args, **kwargs)
            case ClusterizationMethodType.MEAN_SHIFT:
                clusters = cls.clusterize_mean_shift(columns, *args, **kwargs)
            case _:
                raise ValueError('Invalid clusterization method type value.')

        return clusters

    @classmethod
    def clusterize_k_means(cls, columns: List[str], cluster_count: int = 8) -> np.ndarray:
        kmeans: KMeans = KMeans(n_clusters=cluster_count)
        clusters: np.ndarray = kmeans.fit_predict(cls._data[columns])
        return clusters

    @classmethod
    def clusterize_density(cls, columns: List[str], eps: float = 0.5, min_samples: int = 5) -> np.ndarray:
        dbscan: DBSCAN = DBSCAN(eps=eps, min_samples=min_samples)
        clusters: np.ndarray = dbscan.fit_predict(cls._data[columns])
        return clusters

    @classmethod
    def clusterize_agglomerative(cls, columns: List[str], cluster_count: int = 2) -> np.ndarray:
        agg_clustering: AgglomerativeClustering = AgglomerativeClustering(n_clusters=cluster_count)
        clusters: np.ndarray = agg_clustering.fit_predict(cls._data[columns])
        return clusters

    @classmethod
    def clusterize_gaussian_mixture(cls, columns: List[str], component_count: int = 1) -> np.ndarray:
        gmm: GaussianMixture = GaussianMixture(n_components=component_count)
        clusters: np.ndarray = gmm.fit_predict(cls._data[columns])
        return clusters

    @classmethod
    def clusterize_affinity_propagation(cls, columns: List[str], damping: float = 0.5, iteration_count: int = 200) -> np.ndarray:
        affinity_prop: AffinityPropagation = AffinityPropagation(damping=damping, max_iter=iteration_count)
        clusters: np.ndarray = affinity_prop.fit_predict(cls._data[columns])
        return clusters

    @classmethod
    def clusterize_mean_shift(cls, columns: List[str], iteration_count: int = 300) -> np.ndarray:
        mean_shift: MeanShift = MeanShift(max_iter=iteration_count)
        clusters: np.ndarray = mean_shift.fit_predict(cls._data[columns])
        return clusters


def _check_if_valid_enum(value: str|int, enum: Type[Enum]) -> Enum:
    if isinstance(value, int):
        if value >= len(enum) or value < 0:
            raise ValueError(f'Invalid edit type value! Integer value must be within range 0 to {len(enum) - 1}.')
        else:
            return enum(value)

    try:
        enum_value = enum[value]
    except KeyError:
        raise ValueError(f'Invalid edit type value! String value must be a valid {enum.__name__} enum member.')
    return enum_value


@eel.expose
def DataService_data() -> Optional[str]:
    return DataService.data().to_json()


@eel.expose
def DataService_load() -> str:
    data_path = DataService.get_file_path()
    DataService.load(data_path).to_json()
    return data_path


@eel.expose
def DataService_save(data_path: Optional[str] = None) -> None:
    DataService.save(data_path)


@eel.expose
def DataService_modify(edit_type: str|int, *args, **kwargs) -> None:
    DataService.modify(_check_if_valid_enum(edit_type, DataEditOperationType), *args, **kwargs)


@eel.expose
def DataService_add_rows(rows: Dict[str, Any]) -> None:
    DataService.add_rows(rows)


@eel.expose
def DataService_remove_rows(rows: List[int|str]|int|str) -> None:
    DataService.remove_rows(rows)


@eel.expose
def DataService_add_columns(columns: Dict[str, Any]) -> None:
    DataService.add_columns(columns)


@eel.expose
def DataService_remove_columns(columns: List[str]|str) -> None:
    DataService.remove_columns(columns)


@eel.expose
def DataService_rename_row(row: int|str, new_name: str) -> None:
    DataService.rename_row(row, new_name)


@eel.expose
def DataService_rename_column(old_name: str, new_name: str) -> None:
    DataService.rename_column(old_name, new_name)


@eel.expose
def DataService_modify_value_at(row: str|int, column_name: str, new_value: Any) -> None:
    DataService.modify_value_at(row, column_name, new_value)


@eel.expose
def DataService_normalize_numerical(columns: List[str], method_type: str|int = None) -> None:
    if method_type is None:
        DataService.normalize_numerical(columns)
    else:
        DataService.normalize_numerical(columns, _check_if_valid_enum(method_type, NumericalNormalizationType))


@eel.expose
def DataService_normalize_categorical(columns: List[str], method_type: str|int = None) -> None:
    if method_type is None:
        DataService.normalize_numerical(columns)
    else:
        DataService.normalize_numerical(columns, _check_if_valid_enum(method_type, CategoricalNormalizationType))


@eel.expose
def DataService_normalize(columns: Optional[List[str]] = None, numerical_method_type: str|int = None, categorical_method_type: str|int = None) -> None:
    numerical: Optional[NumericalNormalizationType] = NumericalNormalizationType.MIN_MAX
    if numerical_method_type is not None:
        numerical = _check_if_valid_enum(numerical_method_type, NumericalNormalizationType)

    categorical: Optional[CategoricalNormalizationType] = CategoricalNormalizationType.LABEL
    if categorical_method_type is not None:
        categorical = _check_if_valid_enum(categorical_method_type, CategoricalNormalizationType)

    DataService.normalize(columns, numerical, categorical)


@eel.expose
def DataService_clusterize(columns: List[str], clusterization_method_type: str|int, *args, **kwargs) -> str:
    clusterization_method: ClusterizationMethodType = _check_if_valid_enum(clusterization_method_type, ClusterizationMethodType)
    return str(DataService.clusterize(columns, clusterization_method, *args, **kwargs))


@eel.expose
def DataService_clusterize_k_means(columns: List[str], cluster_count: int = 8) -> np.ndarray:
    return DataService.clusterize_k_means(columns, cluster_count)


@eel.expose
def DataService_clusterize_density(columns: List[str], eps: float = 0.5, min_samples: int = 5) -> np.ndarray:
    return DataService.clusterize_density(columns, eps, min_samples)


@eel.expose
def DataService_clusterize_agglomerative(columns: List[str], cluster_count: int = 2) -> np.ndarray:
    return DataService.clusterize_agglomerative(columns, cluster_count)


@eel.expose
def DataService_clusterize_gaussian_mixture(columns: List[str], component_count: int = 1) -> np.ndarray:
    return DataService.clusterize_gaussian_mixture(columns, component_count)


@eel.expose
def DataService_clusterize_affinity_propagation(columns: List[str], damping: float = 0.5, iteration_count: int = 200) -> np.ndarray:
    return DataService.clusterize_affinity_propagation(columns, damping, iteration_count)


@eel.expose
def DataService_clusterize_mean_shift(columns: List[str], iteration_count: int = 300) -> np.ndarray:
    return DataService.clusterize_mean_shift(columns, iteration_count)
