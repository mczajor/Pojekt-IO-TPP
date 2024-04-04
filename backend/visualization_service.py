
from pathlib import Path
from typing import Any, Union, Optional, List

import eel

import numpy as np
import pandas as pd


from pandas import DataFrame as Data
from sklearn.decomposition import PCA

from backend.singleton import Singleton

from backend.data_service import DataService


class VisualizationService(Singleton):
    _default_save_path: Path = Path.home()

    @classmethod
    def visualize_pca(cls, data: Data, component_count: int = 2) -> dict[str, Union[list, Any]]:
        pca: PCA = PCA(n_components=component_count) # Wybierz liczbę komponentów głównych

        principal_components: np.ndarray = pca.fit_transform(data) # Dopasowanie modelu do danych
        result_dataframe: pd.DataFrame = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2']) # Utwórz DataFrame z wynikami PCA
        merged_dataframe = pd.concat([data, result_dataframe], axis=1) # Połącz wyniki PCA z oryginalnymi danymi

        pca_components_df = pd.DataFrame(pca.components_, columns=data.columns)

        column_vector = pca_components_df.columns.tolist()
        eigenvector_1 = pca_components_df.values[0]
        eigenvector_2 = pca_components_df.values[1]

        eigenvector_1_rounded = [round(num, 6) for num in eigenvector_1]
        eigenvector_2_rounded = [round(num, 6) for num in eigenvector_2]

        x = merged_dataframe['PC1'].values
        y = merged_dataframe['PC2'].values

        x_filtered = x[~np.isnan(x)]
        y_filtered = y[~np.isnan(y)]

        data = {
            "column_vector": column_vector,
            "eigenvector_1": eigenvector_1_rounded,  # Konwertowanie na listę, jeśli to jest numpy array
            "eigenvector_2": eigenvector_2_rounded,  # Konwertowanie na listę, jeśli to jest numpy array
            "x": x_filtered.tolist(),
            "y": y_filtered.tolist()
        }

        return data


@eel.expose
def VisualizationService_visualize_pca(column_names: Optional[List[str]] = None, component_count: int = 2)\
        -> dict[str, Union[list, Any]]:
    data = DataService.normalized_data()

    if column_names:
        data = data.loc[:, column_names]

    return VisualizationService.visualize_pca(data, component_count)