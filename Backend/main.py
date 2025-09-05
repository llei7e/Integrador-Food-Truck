from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud, database
from fastapi.middleware.cors import CORSMiddleware




models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/produtos/", response_model=schemas.ProdutoOut)
def criar_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    return crud.criar_produto(db, produto)

@app.get("/produtos/", response_model=list[schemas.ProdutoOut])
def listar_produtos(db: Session = Depends(get_db)):
    return crud.listar_produtos(db)

@app.post("/pedidos/", response_model=schemas.PedidoOut)
def criar_pedido(pedido: schemas.PedidoCreate, db: Session = Depends(get_db)):
    db_pedido = crud.criar_pedido(db, pedido)
    if not db_pedido:
        raise HTTPException(status_code=400, detail="Produto inexistente ou estoque insuficiente")
    return db_pedido
