from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "Usuario"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    tipo = Column(String)
    data_criacao = Column(DateTime)


class Pedido(Base):
    __tablename__ = "Pedido"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("Usuario.id"))
    foodtruck_id = Column(Integer)
    status = Column(String)
    total = Column(Integer)
    data_criacao = Column(DateTime)


class Produto(Base):
    __tablename__ = "Produto"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    descricao = Column(String)
    preco = Column(Integer)
    categoria_id = Column(Integer, ForeignKey("Categoria.id"))
    ativo = Column(Boolean)


class ItemPedido(Base):
    __tablename__ = "ItemPedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("Pedido.id"))
    produto_id = Column(Integer, ForeignKey("Produto.id"))


class Estoque(Base):
    __tablename__ = "Estoque"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("Produto.id"))
    quantidade = Column(Integer)
    unidade = Column(String)


class Pagamento(Base):
    __tablename__ = "Pagamento"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("Pedido.id"))
    metodo = Column(String)
    status = Column(String)
    valor = Column(Integer)
    criado_em = Column(DateTime)


class MovimentacaoEstoque(Base):
    __tablename__ = "MovimentacaoEstoque"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("Produto.id"))
    tipo_movimento = Column(String)
    quantidade = Column(Integer)
    data = Column(DateTime)


class Categoria(Base):
    __tablename__ = "Categoria"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    descricao = Column(String)
    ativo = Column(Boolean)
