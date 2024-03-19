from __future__ import annotations

from pathlib import Path
from typing import Optional

import eel
import pandas as pd
from pandas import DataFrame as Data

from backend.singleton import Singleton


class FileService(Singleton):
    _default_save_path: Path = Path.home()

    @classmethod
    def load(cls, file_path: Path|str) -> Data:
        file_path = cls._check_if_file_path_is_valid(file_path)
        if not file_path.exists():
            raise FileNotFoundError('File does not exist.')
        if not file_path.is_file():
            raise IsADirectoryError('Specified path is not a file.')
        if not file_path.suffix.lower() == ".csv":
            raise ValueError('Unsupported file format. Must be a CSV file.')

        try:
            data: Data = pd.read_csv(file_path.absolute())
            return data
        except Exception as exception:
            raise IOError(f'Error while loading file: {exception}')

    @classmethod
    def save(cls, data: Data, file_path: Optional[Path|str] = None) -> None:
        if file_path:
            file_path = cls._check_if_file_path_is_valid(file_path)
            cls._save_to_specified_location(data, file_path)
        else:
            cls._save_to_default_location(data)

    @classmethod
    def set_default_save_location(cls, new_default_save_path: Path|str) -> None:
        new_default_path: Path = cls._check_if_file_path_is_valid(new_default_save_path)
        if not new_default_path.exists():
            raise FileNotFoundError('Specified directory does not exist.')
        if not new_default_path.is_dir():
            raise NotADirectoryError('Specified path is not a directory.')

        cls._default_save_path = new_default_path

    @classmethod
    def _save_to_specified_location(cls, data: Data, file_path: Path) -> None:
        try:
            cls._dump_to_csv(data, file_path)
        except Exception as exception:
            raise IOError(f"Error saving data: {exception}")

    @classmethod
    def _save_to_default_location(cls, data: Data) -> None:
        try:
            file_path: Path = cls._default_save_path.joinpath('data.csv')
            cls._dump_to_csv(data, file_path)
        except Exception as exception:
            raise IOError(f"Error saving data to default location: {exception}")

    @staticmethod
    def _dump_to_csv(data: Data, file_path: Path) -> None:
        data.to_csv(file_path.absolute(), index=False) # TODO here setup default save settings

    @staticmethod
    def _check_if_file_path_is_valid(file_path: Path|str) -> Path:
        if not isinstance(file_path, (str, Path)):
            raise TypeError('Invalid argument type. File path must be of type "str" or "Path".')
        if isinstance(file_path, str):
            file_path = Path(file_path)

        return file_path


@eel.expose
def FileService_load(file_path: str) -> str:
    data: str = FileService.load(file_path).to_json()
    return data


@eel.expose
def FileService_save(data: Data, file_path: Optional[str] = None) -> None:
    FileService.save(data, file_path)


@eel.expose
def FileService_set_default_save_location(new_default_save_path: str) -> None:
    FileService.set_default_save_location(new_default_save_path)
