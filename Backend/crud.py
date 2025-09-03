from sqlalchemy.orm import Session
import models, schemas

def criar_produto(db: Session, produto: schemas.ProdutoCreate):
    db_produto = models.Produto(**produto.dict())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def listar_produtos(db: Session):
    return db.query(models.Produto).all()

def criar_pedido(db: Session, pedido: schemas.PedidoCreate):
    produto = db.query(models.Produto).filter(models.Produto.id == pedido.produto_id).first()
    if not produto or produto.estoque < pedido.quantidade:
        return None  # sem estoque suficiente

    produto.estoque -= pedido.quantidade
    db_pedido = models.Pedido(**pedido.dict())
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    return db_pedido
