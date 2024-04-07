from copy import deepcopy
from enum import Enum, auto
from pathlib import Path
from tkinter import Tk
from tkinter import filedialog
from typing import Optional, Dict, Any, List, Type, Union

import eel
import numpy as np
import pandas as pd
from pandas import DataFrame as Data
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, AffinityPropagation, MeanShift
from sklearn.metrics import silhouette_score
from sklearn.mixture import GaussianMixture
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler, OneHotEncoder

from backend.errors import NullValuesError, ErrorCode
from backend.file_service import FileService
from backend.singleton import Singleton
from sklearn import metrics


class DataEditOperationType(Enum):
    ADD_ROW = 0
    REMOVE_ROW = auto()
    ADD_COLUMN = auto()
    REMOVE_COLUMN = auto()
    RENAME_ROW = auto()
    RENAME_COLUMN = auto()
    MODIFY_VALUE = auto()
    REMOVE_NAN = auto()


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


def notnull(message: str):
    def decorator(func):
        def wrapper(cls, *args, **kwargs):
            if cls._contains_null_values():
                raise NullValuesError(message)
            return func(cls, *args, **kwargs)
        return wrapper
    return decorator


class DataService(Singleton):
    _data: Optional[Data] = None
    _normalized_data: Optional[Data] = None
    _file_name: str = ""
    _last_clusters: Optional[np.ndarray] = None

    @classmethod
    def data(cls) -> Optional[Data]:
        return cls._data

    @classmethod
    def last_clusters(cls) -> Optional[List[str]]:
        return cls._last_clusters

    @classmethod
    def file_name(cls) -> Optional[str]:
        return cls._file_name

    @classmethod
    def normalized_data(cls) -> Optional[Data]:
        return cls._normalized_data

    @classmethod
    def set_normalized_data(cls) -> None:
        cls._normalized_data = deepcopy(cls._data)

    @classmethod
    def column_type(cls, column_name: str):
        return cls._data[column_name].dtype

    @classmethod
    def change_column_type(cls, column_name: str, new_type: int) -> None:
        if new_type == 0:
            cls._data[column_name] = cls._data[column_name].astype('float64')
        else:
            cls._data[column_name] = cls._data[column_name].astype('str')

    @classmethod
    def load(cls, data_path: Path|str) -> Data:
        cls._data = FileService.load(data_path)
        return cls._data

    @classmethod
    def save(cls, data_path: Optional[Path|str] = None, with_clusters: bool = False) -> None:
        if with_clusters and cls._last_clusters is None:
            raise ValueError('No clusterization was made, clusterize first to save data with cluster ids!')
        elif with_clusters:
            data_with_cluster_id: Data = deepcopy(cls._data)
            data_with_cluster_id['cluster_id'] = cls._last_clusters
            FileService.save(data_with_cluster_id, data_path)
        else:
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
            case DataEditOperationType.REMOVE_NAN:
                cls.remove_nan(*args, **kwargs)
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
        _type = cls.column_type(column_name)
        if _type == "object" or _type == "str":
            new_value = str(new_value)
        else:
            new_value = float(new_value)
        cls._data.at[row, column_name] = new_value

    @classmethod
    def remove_nan(cls) -> None:
        cls._data = cls._data.dropna()

    @classmethod
    def get_file_path(cls) -> str:
        root: Tk = Tk()
        root.filename = filedialog.askopenfilename(initialdir="/", title="Select file", filetypes=[("CSV files", "*.csv")])
        root.destroy()
        cls._file_name = root.filename
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

        cls._normalized_data[columns] = scaler.fit_transform(cls._data[columns])

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
            cls._normalized_data[column] = encoder.fit_transform(cls._data[column])

    @classmethod
    def normalize(cls, columns: Optional[List[str]] = None,
                  numerical_method: NumericalNormalizationType = NumericalNormalizationType.MIN_MAX,
                  categorical_method: CategoricalNormalizationType = CategoricalNormalizationType.LABEL) -> None:
        cls.set_normalized_data()
        if columns is None:
            columns = cls._normalized_data.columns

        numerical_columns: List[pd.Index] = cls._normalized_data.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns: List[pd.Index] = cls._normalized_data.select_dtypes(include=[object]).columns.tolist()    ## Dla wersji poniżej 1.23.5 np.object

        numerical_to_normalize: List[str] = list(set(columns) & set(numerical_columns))
        categorical_to_normalize: List[str] = list(set(columns) & set(categorical_columns))

        if numerical_to_normalize:
            cls.normalize_numerical(numerical_to_normalize, numerical_method)
        if categorical_to_normalize:
            cls.normalize_categorical(categorical_to_normalize, categorical_method)

    @classmethod
    def clusterize(cls, columns: List[str], clusterizationMethod: ClusterizationMethodType, cluster_count: int = 3, *args, **kwargs) -> Dict[str, List[Any]]:
        if columns is None:
            columns = cls._normalized_data.columns
        match clusterizationMethod:
            case ClusterizationMethodType.K_MEANS:
                clusters = cls.clusterize_k_means(columns, cluster_count, *args, **kwargs)
            case ClusterizationMethodType.DBSCAN:
                clusters = cls.clusterize_density(columns, *args, **kwargs)
            case ClusterizationMethodType.AGGLOMERATIVE:
                clusters = cls.clusterize_agglomerative(columns, cluster_count, *args, **kwargs)
            case ClusterizationMethodType.GAUSSIAN:
                clusters = cls.clusterize_gaussian_mixture(columns, cluster_count, *args, **kwargs)
            case ClusterizationMethodType.AFFINITY:
                clusters = cls.clusterize_affinity_propagation(columns, *args, **kwargs)
            case ClusterizationMethodType.MEAN_SHIFT:
                clusters = cls.clusterize_mean_shift(columns, *args, **kwargs)
            case _:
                raise ValueError('Invalid clusterization method type value.')

        cls._last_clusters = clusters
        data = {
            "clusters": clusters.tolist()
        }

        return data

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_k_means(cls, columns: List[str], cluster_count: int = 8) -> np.ndarray:
        kmeans: KMeans = KMeans(n_clusters=cluster_count)
        clusters: np.ndarray = kmeans.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_density(cls, columns: List[str], eps: float = 0.5, min_samples: int = 5) -> np.ndarray:
        dbscan: DBSCAN = DBSCAN(eps=eps, min_samples=min_samples)
        clusters: np.ndarray = dbscan.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_agglomerative(cls, columns: List[str], cluster_count: int = 2) -> np.ndarray:
        agg_clustering: AgglomerativeClustering = AgglomerativeClustering(n_clusters=cluster_count)
        clusters: np.ndarray = agg_clustering.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_gaussian_mixture(cls, columns: List[str], component_count: int = 1) -> np.ndarray:
        gmm: GaussianMixture = GaussianMixture(n_components=component_count)
        clusters: np.ndarray = gmm.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_affinity_propagation(cls, columns: List[str], damping: float = 0.5, iteration_count: int = 200) -> np.ndarray:
        affinity_prop: AffinityPropagation = AffinityPropagation(damping=damping, max_iter=iteration_count)
        clusters: np.ndarray = affinity_prop.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Clusterization can not be made with cells containing null values. Remove or fill them first!")
    def clusterize_mean_shift(cls, columns: List[str], iteration_count: int = 300) -> np.ndarray:
        mean_shift: MeanShift = MeanShift(max_iter=iteration_count)
        clusters: np.ndarray = mean_shift.fit_predict(cls._normalized_data[columns])
        return clusters

    @classmethod
    @notnull(message="Cluster tendency score can not be calculated with cells containing null values. Remove or fill them first!")
    def get_cluster_tendency_score(cls, sample_size: int = 0.1) -> float:
        if cls._contains_null_values():
            raise NullValuesError()

        rows, dimensions = cls._data.shape
        m = int(sample_size * rows)

        neighbours: NearestNeighbors = NearestNeighbors(n_neighbors=2).fit(cls._data.to_numpy())

        data_sample = cls._data.sample(n=m, replace=False).to_numpy()
        y_sample = np.random.uniform(cls._data.min(axis=0), cls._data.max(axis=0), size=(m, dimensions))

        w_distances, _ = neighbours.kneighbors(data_sample, return_distance=True)
        w_distances = w_distances[:, 1]

        u_distances, _ = neighbours.kneighbors(y_sample, n_neighbors=1, return_distance=True)

        w_sum = (w_distances ** dimensions).sum()
        u_sum = (u_distances ** dimensions).sum()
        return u_sum / (u_sum + w_sum)

    @classmethod
    def get_cluster_metrics(cls) -> Dict[str, Any]:
        return {
            "Silhoutte Coefficient": metrics.silhouette_score(cls._data, cls._last_clusters),
            "Davies-Bouldin index": metrics.davies_bouldin_score(cls._data, cls._last_clusters),
            "Calinski-Harabasz index": metrics.calinski_harabasz_score(cls._data, cls._last_clusters),
            "Intra-cluster Silhouette index": metrics.silhouette_samples(cls._data, cls._last_clusters),
        }

    @classmethod
    def _contains_null_values(cls) -> bool:
        return len(cls._data) != len(deepcopy(cls._data).dropna())


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


def choose_optimal_clusters(column_names, clusterization_method, min_clusters=2, max_clusters=100, *args, **kwargs):
    data = DataService.normalized_data()

    if column_names:
        data = data.loc[:, column_names]
    best_score = -1
    best_num_clusters = -1

    for num_clusters in range(min_clusters, max_clusters + 1):
        cluster_labels = DataService.clusterize(column_names, clusterization_method, num_clusters, *args, **kwargs)["clusters"]

        silhouette_avg = silhouette_score(data, cluster_labels)

        if silhouette_avg > best_score:
            best_score = silhouette_avg
            best_num_clusters = num_clusters

    result = {
        "silhouette_avg": best_score,
        "num_clusters": best_num_clusters,
    }
    return result


@eel.expose
def DataService_suggest_cluster_nb(column_names: List[str] = None, clusterization_method_type: str|int = 0, *args, **kwargs):
    clusterization_method: ClusterizationMethodType = _check_if_valid_enum(clusterization_method_type, ClusterizationMethodType)
    return choose_optimal_clusters(column_names, clusterization_method, *args, **kwargs)


@eel.expose
def DataService_data() -> Optional[str]:
    return DataService.data().to_json()


@eel.expose
def DataService_last_clusters() -> Optional[List[str]]:
    return DataService.last_clusters()


@eel.expose
def DataService_load() -> str:
    data_path = "./input-data.csv" #DataService.get_file_path()
    DataService.load(data_path).to_json()
    DataService.set_normalized_data()
    return data_path


@eel.expose
def DataService_file_name() -> Optional[str]:
    return DataService.file_name()


@eel.expose
def DataService_normalized_data() -> Optional[str]:
    return DataService.normalized_data().to_json()


@eel.expose
def DataService_save(data_path: Optional[str] = None, with_clusters: bool = False) -> None:
    DataService.save(data_path, with_clusters)


@eel.expose
def DataService_column_type(column_name: str) -> str:
    _type = str(DataService.column_type(column_name))
    return 'Kategoryczny' if _type in ['object', 'str'] else 'Numeryczny'


@eel.expose
def DataService_change_column_type(column_name: str, new_type: int) -> None:
    DataService.change_column_type(column_name, new_type)
    DataService.set_normalized_data()


@eel.expose
def DataService_modify(edit_type: str|int, *args, **kwargs) -> None:
    DataService.modify(_check_if_valid_enum(edit_type, DataEditOperationType), *args, **kwargs)
    DataService.set_normalized_data()


@eel.expose
def DataService_add_rows(rows: Dict[str, Any]) -> None:
    DataService.add_rows(rows)
    DataService.set_normalized_data()


@eel.expose
def DataService_remove_rows(rows: List[int|str]|int|str) -> None:
    DataService.remove_rows(rows)
    DataService.set_normalized_data()


@eel.expose
def DataService_add_columns(columns: Dict[str, Any]) -> None:
    DataService.add_columns(columns)
    DataService.set_normalized_data()


@eel.expose
def DataService_remove_columns(columns: List[str]|str) -> None:
    DataService.remove_columns(columns)
    DataService.set_normalized_data()


@eel.expose
def DataService_rename_row(row: int|str, new_name: str) -> None:
    DataService.rename_row(row, new_name)
    DataService.set_normalized_data()


@eel.expose
def DataService_rename_column(old_name: str, new_name: str) -> None:
    DataService.rename_column(old_name, new_name)
    DataService.set_normalized_data()


@eel.expose
def DataService_modify_value_at(row: str|int, column_name: str, new_value: Any) -> None:
    DataService.modify_value_at(row, column_name, new_value)
    DataService.set_normalized_data()

@eel.expose
def DataService_remove_nan() -> None:
    DataService.remove_nan()
    DataService.set_normalized_data()


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
def DataService_clusterize(columns: List[str], clusterization_method_type: str|int, *args, **kwargs) -> Dict[str, List[Any]]|int:
    clusterization_method: ClusterizationMethodType = _check_if_valid_enum(clusterization_method_type, ClusterizationMethodType)
    try:
        return DataService.clusterize(columns, clusterization_method, *args, **kwargs)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_k_means(columns: List[str], cluster_count: int = 8) -> np.ndarray:
    try:
        return DataService.clusterize_k_means(columns, cluster_count)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_density(columns: List[str], eps: float = 0.5, min_samples: int = 5) -> np.ndarray:
    try:
        return DataService.clusterize_density(columns, eps, min_samples)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_agglomerative(columns: List[str], cluster_count: int = 2) -> np.ndarray:
    try:
        return DataService.clusterize_agglomerative(columns, cluster_count)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_gaussian_mixture(columns: List[str], component_count: int = 1) -> np.ndarray:
    try:
        return DataService.clusterize_gaussian_mixture(columns, component_count)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_affinity_propagation(columns: List[str], damping: float = 0.5, iteration_count: int = 200) -> np.ndarray:
    try:
        return DataService.clusterize_affinity_propagation(columns, damping, iteration_count)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_clusterize_mean_shift(columns: List[str], iteration_count: int = 300) -> np.ndarray:
    try:
        return DataService.clusterize_mean_shift(columns, iteration_count)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_get_cluster_tendency_score(sample_size: int = 0.1) -> float:
    try:
        return DataService.get_cluster_tendency_score(sample_size)
    except NullValuesError as e:
        print("ERROR:", e)
        return ErrorCode.NULL_VALUES_ERROR
    except Exception as e:
        print("ERROR:", e)
        return ErrorCode.LIBRARY_ERROR


@eel.expose
def DataService_get_cluster_metrics() -> Dict[str, Any]:
    return DataService.get_cluster_metrics()
