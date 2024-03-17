from enum import Enum, auto
from pathlib import Path
from typing import Optional, Dict, Any, List

import eel
from pandas import DataFrame as Data

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


@eel.expose
def DataService_data() -> Optional[str]:
    return DataService.data().to_json()


@eel.expose
def DataService_load(data_path: str) -> str:
    return DataService.load(data_path).to_json()


@eel.expose
def DataService_save(data_path: Optional[str] = None) -> None:
    DataService.save(data_path)


@eel.expose
def DataService_modify(edit_type: str|int, *args, **kwargs) -> None:
    if isinstance(edit_type, int):
        if edit_type >= len(DataEditOperationType) or edit_type < 0:
            raise ValueError(f'Invalid edit type value! Integer value must be within range 0 to {len(DataEditOperationType)-1}.')
        else:
            DataService.modify(DataEditOperationType(edit_type), *args, **kwargs)
            return

    try:
        edit_type_enum: DataEditOperationType = DataEditOperationType[edit_type]
    except KeyError:
        raise ValueError('Invalid edit type value! String value must be a valid DataEditOperationType enum member.')
    DataService.modify(edit_type_enum, *args, **kwargs)


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
