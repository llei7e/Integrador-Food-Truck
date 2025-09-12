from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ================= Usuario =================
class UsuarioBase(BaseModel):
    nome: str
    tipo: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioResponse(UsuarioBase):
    id: int
    data_criacao: Optional[datetime]

    class Config:
        from_attributes = True


# ================= Produto =================
class ProdutoBase(BaseModel):
    nome: str
    descricao: str
    preco: int
    categoria_id: int
    ativo: bool

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoResponse(ProdutoBase):
    id: int

    class Config:
        from_attributes = True


# ================= Pedido =================
class PedidoBase(BaseModel):
    usuario_id: int
    foodtruck_id: int
    status: str
    total: int

class PedidoCreate(PedidoBase):
    pass

class PedidoResponse(PedidoBase):
    id: int
    data_criacao: Optional[datetime]

    class Config:
        from_attributes = True
