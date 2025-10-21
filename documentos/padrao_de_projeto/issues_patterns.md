# 📝 **Padrão de Criação de Issues**

Um gerenciamento eficiente de **Issues** é essencial para a organização e colaboração em projetos.  
Seguir padrões claros auxilia na definição das propriedades de cada tarefa no **Board**, como dificuldade, prioridade e datas de entrega.

---

## 🎯 *Padrão Adotado*  

- **Título:** Título objetivo e claro  
- **Assignees:** Responsáveis pela tarefa  
- **Labels:** Etiquetas que sinalizam propriedades da tarefa *(ex: prioridade, tipo de tarefa)*  
- **Projects:** Projeto ao qual a tarefa está vinculada  
- **Status:** Estado atual da tarefa → `Backlog | In Progress | Finished`  
- **Esforço:** Nível de dedicação estimado → `P | M | G`  
- **Desenvolvimento:** Etapa da tarefa → `Backend | Frontend | Prototipação | Cloud | Integração | Documentação | Mobile | Banco de Dados`  
- **Criado em:** Data de criação da tarefa  
- **Iniciado em:** Data de início do desenvolvimento  
- **Finalizado em:** Data de conclusão da tarefa  
- **Sprint:** Sprint correspondente → `Sprint 1 | Sprint 2`  
- **Milestone:** Entregas agrupadas  
- **Rastreabilidade:** Links relacionados → `PR | Documentação | Relacionamentos`  

---


## 🔄 **Fluxo de Trabalho Comum**  

1. **Criar uma Branch**  
   - Sempre baseada em `main` ou `develop`.  
   - Exemplo:  
     ```bash
     git checkout -b feature/user-authentication
     ```

2. **Desenvolver na Branch**  
   - Realize commits claros, seguindo o [padrão de commits](commit-patterns.md).  

3. **Abrir um Pull Request (PR)**  
   - Após finalizar, crie um PR para revisão.  

4. **Merge da Branch**  
   - Depois da aprovação, faça o merge na branch principal.  

5. **Deletar a Branch**  
   - Evite acúmulo de branches antigas.  

---

## 🌳 **Estrutura de Branches Recomendada**  
```yaml
main
|
|-- develop
    |-- feature/login-system
    |-- feature/user-profile
    |-- bugfix/fix-login-error

### **Regras Gerais:**  

- Utilizar apenas letras minúsculas.  
- Sem uso acentos e caracteres especiais.
- Substituir espaços por '-'
- Nomear sempre em Português, de forma descritiva e curta.  
- Manter uma estrutura consistente: `categoria/descricao`.

---

### **Benefícios do Padrão:** 
1. **Organização:** 
   - Facilita o entendimento do propósito de cada branch.  
2. **Escalabilidade:**
   - Funciona bem para equipes de qualquer tamanho.  
3. **Integração:**
   - Compatível com CI/CD pipelines e ferramentas modernas.  
4. **Colaboração:**
   - Melhora o fluxo de trabalho em equipe e a revisão de código.  

Esse padrão é amplamente utilizado em projetos que seguem metodologias ágeis ou DevOps, proporcionando maior eficiência e controle.

---

### **Exemplo do Fluxo (GitFlow):** 

![image](https://github.com/user-attachments/assets/df96db66-feb3-4054-874d-b0b746640a3a)


### [**> Retornar à Página Inicial.**](/README.md)
