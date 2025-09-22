# 🌿 **Gerenciamento de Branches**

Um gerenciamento eficiente de **branches** é essencial para manter a **organização**, **colaboração** e **fluxo contínuo de integração** no projeto.  
Boas práticas como **Git Flow**, **GitHub Flow** e **Trunk-Based Development** trazem estruturas claras que ajudam equipes de todos os tamanhos.

---

## 🎯 **Padrão Adotado**

### 🔗 **Branches relacionadas a Issues**

**Estrutura padrão:**   
`feature/<nome-da-tarefa>/<numero da issue>` 

### 🗂️ **Tipos de Branch**  

- `feature/nome-da-feature` → novas funcionalidades  
- `bugfix/nome-do-bug` → correção de bugs  
- `hotfix/nome-do-hotfix` → correções urgentes em produção  
- `release/nome-da-versão` → preparação de versão para produção  
- `chore/nome-da-tarefa` → manutenção (atualizações de dependências, configs etc.)  

### ✨ **Exemplos de Uso**

```bash
feature/autenticacao-usuario/01
bugfix/fix-login-error/09
hotfix/correcao-autenticacao-critico/11
release/v1.0.0/15
chore/atualizacao-dependencias/30 
```

### **Fluxo de Trabalho Comum**  

1. **Criar uma Branch:**  
   - Baseie-se na branch principal (`main`) ou de desenvolvimento (`develop`).  
   - Exemplo:  
     ```bash
     git checkout -b feature/autenticacao-usuario
     ```

2. **Trabalhar na Branch:**  
   - Realize commits com mensagens claras e no [formato padrão](commit-patterns.md).  

3. **Abrir um Pull Request (PR):**  
   - Ao concluir o desenvolvimento, abra um PR (***Pull Request***) para revisão do código.

4. **Merge da Branch:**  
   - Após aprovação e validação, realize o merge na branch principal.

5. **Deletar a Branch:**  
   - Para evitar acúmulo de branches obsoletas.

---

### **Estrutura de Branches Recomendada:**  
```yaml
main
|
|-- develop
    |-- feature/login-system/02
    |-- feature/user-profile/06
    |-- bugfix/fix-login-error/10
```

---

### **Regras Gerais:**  

- Utilizar apenas letras minúsculas.  
- Sem uso de acentuação e caracteres especiais.  
- Substituir espaços por -  
- Nomear sempre em Inglês, de forma descritiva e curta.  
- Manter uma estrutura consistente: `feature/descricao`.

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

### REGRAS PARA PULL REQUEST

- Colocar # <numero_da_issue> na descrição do Pull Request
- Revisar código

---

### [**> Retornar à Página Inicial.**](/README.md)
