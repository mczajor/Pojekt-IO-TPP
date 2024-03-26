import base64
import io
from pathlib import Path

import eel
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pandas import DataFrame as Data
from sklearn.decomposition import PCA

from backend.singleton import Singleton

from backend.data_service import DataService


class VisualizationService(Singleton):
    _default_save_path: Path = Path.home()

    @classmethod
    def visualize_pca(cls, data: Data, component_count: int = 2) -> str:
        pca: PCA = PCA(n_components=component_count) # Wybierz liczbę komponentów głównych

        principal_components: np.ndarray = pca.fit_transform(data) # Dopasowanie modelu do danych
        result_dataframe: pd.DataFrame = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2']) # Utwórz DataFrame z wynikami PCA
        merged_dataframe = pd.concat([data, result_dataframe], axis=1) # Połącz wyniki PCA z oryginalnymi danymi

        # Wykres punktowy 2D dla dwóch pierwszych komponentów głównych
        plt.scatter(merged_dataframe['PC1'], merged_dataframe['PC2'])
        plt.title('PCA - Principal Component Analysis')
        plt.xlabel('Principal Component 1')
        plt.ylabel('Principal Component 2')

        path = "frontend/frontend/src/assets/obraz.png"
        # Zapisz wykres jako bajty w pamięci
        img_bytes: io.BytesIO = io.BytesIO()
        plt.savefig(path, format='png')
        img_bytes.seek(0)

        plt.clf() # Wyczyść obecny wykres, aby nie wyświetlał się na ekranie

        return path


@eel.expose
def VisualizationService_visualize_pca(component_count: int = 2) -> str:
    data = DataService.data()
    return VisualizationService.visualize_pca(data, component_count)
