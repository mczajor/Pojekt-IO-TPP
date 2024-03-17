from typing import Any, Optional, Self


class SingletonMeta(type):
    _instance: Optional[Self] = None # save one copy of a class and return if constructor is called

    def __call__(cls, *args, **kwargs) -> Self:
        if cls._instance is None:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class Singleton(metaclass=SingletonMeta):
    def __call__(self) -> Self:
        return self

    def __getattr__(self, name) -> Any:
        return getattr(self(), name)
