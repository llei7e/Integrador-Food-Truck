from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime

# ============ USUARIO ============
def criar_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(
        nome=usuario.nome,
        tipo=usuario.tipo,
        data_criacao=datetime.utcnow()
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def listar_usuarios(db: Session):
    return db.query(models.Usuario).all()


# ============ PRODUTO ============
def criar_produto(db: Session, produto: schemas.ProdutoCreate):
    db_produto = models.Produto(
        nome=produto.nome,
        descricao=produto.descricao,
        preco=produto.preco,
        categoria_id=produto.categoria_id,
        ativo=produto.ativo
    )
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def listar_produtos(db: Session):
    return db.query(models.Produto).all()


# ============ PEDIDO ============
def criar_pedido(db: Session, pedido: schemas.PedidoCreate):
    db_pedido = models.Pedido(
        usuario_id=pedido.usuario_id,
        foodtruck_id=pedido.foodtruck_id,
        status=pedido.status,
        total=pedido.total,
        data_criacao=datetime.utcnow()
    )
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    return db_pedido

def listar_pedidos(db: Session):
    return db.query(models.Pedido).all()
