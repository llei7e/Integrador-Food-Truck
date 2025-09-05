from pydantic import BaseModel
from datetime import datetime

class ProdutoBase(BaseModel):
    nome: str
    preco: float
    estoque: int

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoOut(ProdutoBase):
    id: int
    class Config:
        orm_mode = True

class PedidoBase(BaseModel):
    produto_id: int
    quantidade: int

class PedidoCreate(PedidoBase):
    pass

class PedidoOut(PedidoBase):
    id: int
    data: datetime
    class Config:
        orm_mode = True
