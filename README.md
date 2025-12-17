
# Integrador Food Truck

Sistema de **Gerenciamento e Autoatendimento para Food Trucks**, desenvolvido como parte do **Projeto Integrador IV** do curso de **Análise e Desenvolvimento de Sistemas – SENAI Sorocaba/SP**.

O projeto tem como objetivo digitalizar e automatizar os principais processos operacionais de um food truck, como pedidos, controle de estoque, gestão de produtos e acompanhamento de vendas, oferecendo uma experiência moderna tanto para clientes quanto para operadores.

---

## Integrantes

- **Lucas Lima Leite**
- **Henrique Fernandes Pereira**
- **Ricardo Ferreira da Silva**
- **Vinícius Pires de Souza**

---

## Objetivo do Projeto

Desenvolver uma solução web integrada que permita:

- Autoatendimento do cliente via interface web/PWA;
- Gerenciamento de pedidos em tempo real;
- Controle de estoque e produtos;
- Visualização de relatórios operacionais;
- Implantação em nuvem com baixo custo e alta flexibilidade.

O sistema foi pensado para atender pequenos empreendedores, especialmente food trucks, que ainda utilizam processos manuais.

---

## Arquitetura Geral

A arquitetura do sistema é baseada em uma aplicação **monolítica modular**, seguindo boas práticas de separação de camadas:

- **Frontend:** React / Next.js (Web e PWA)
- **Backend:** Java + Spring Boot (API REST)
- **Banco de Dados:** MySQL (Amazon RDS)
- **Infraestrutura:** Amazon EC2
- **Containerização:** Docker

O backend é executado em uma **instância EC2**, utilizando Docker para padronização do ambiente e Nginx como proxy reverso para gerenciamento de requisições HTTP/HTTPS.

---

## Tecnologias Utilizadas

### Backend
- Java 21+
- Spring Boot
- Spring Security (JWT)

### Frontend
- React.js / Next.js
- HTML5, CSS3, JavaScript
- Design responsivo

### Infraestrutura
- Amazon EC2
- Amazon RDS (MySQL)
- Docker
- Nginx

---

## Execução do Backend (EC2)

### Acessar a EC2
```bash
ssh -i integrador-backend.pem ec2-user@IP_PUBLICO
```

### Gerar e executar
```bash
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## Documentações

- **Documento Visão**  
  [Acessar Documento Visão](./documentos/Gestão_Food_Truck.md)

- **Documentação Mobile**  
  [Acessar Documentação Mobile](./mobile/mobile.md)

- **Arquitetura Geral do Sistema**  
  [Acessar Arquitetura Geral do Sistema](./documentos/Arquitetura_Geral_Sistema.md)

- **Diagrama Backend**  
  [Acessar Diagrama Backend](./documentos/Diagrama_Backend.md)

- **Artigo**  
  [Acessar Artigo](./documentos/Artigo_Food_Truck.pdf)

- **Relatório Cyber Security**  
    [Acessar Relatório Cyber](./Cyber%20Security/README.md) 

---

## Resultados Esperados

- Redução do tempo de atendimento;
- Menor incidência de erros manuais;
- Melhor controle de estoque;
- Maior organização operacional;
- Base preparada para evolução futura (CI/CD, escalabilidade).

---

## Trabalhos Futuros

- Pipeline CI/CD automatizado para EC2;
- Integração com meios de pagamento;
- Emissão fiscal automatizada;
- Migração opcional para ECS/EKS conforme crescimento.

---

## Licença

Projeto desenvolvido para fins **acadêmicos** no *SENAI Gaspar Ricardo Junior* em Sorocaba-SP.
