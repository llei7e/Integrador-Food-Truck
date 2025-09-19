from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas, crud, database

app = FastAPI()

# Dependência: abrir/fechar conexão com DB
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ USUARIO ============
@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return crud.criar_usuario(db, usuario)

@app.get("/usuarios/", response_model=list[schemas.UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return crud.listar_usuarios(db)


# ============ PRODUTO ============
@app.post("/produtos/", response_model=schemas.ProdutoResponse)
def criar_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    return crud.criar_produto(db, produto)

@app.get("/produtos/", response_model=list[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    return crud.listar_produtos(db)


# ============ PEDIDO ============
@app.post("/pedidos/", response_model=schemas.PedidoResponse)
def criar_pedido(pedido: schemas.PedidoCreate, db: Session = Depends(get_db)):
    return crud.criar_pedido(db, pedido)

@app.get("/pedidos/", response_model=list[schemas.PedidoResponse])
def listar_pedidos(db: Session = Depends(get_db)):
    return crud.listar_pedidos(db)
