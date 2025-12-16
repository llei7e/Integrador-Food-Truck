# Análise de Segurança com Nikto

*Alvo analisado:* http://172.20.10.3:3000/  
*Ferramenta utilizada:* Nikto 2.5.0  
*Data do scan:* 11/12/2025  
*Objetivo:* Identificar falhas de segurança comuns na aplicação rodando em port 3000 para fins educacionais.

---

## 1. Introdução

Este relatório reúne os principais resultados de uma varredura de segurança realizada com a ferramenta Nikto, utilizada para identificar configurações inadequadas, ausência de cabeçalhos de segurança, possíveis vulnerabilidades em softwares e comportamentos que podem representar riscos em aplicações web.

---

##  2. Resumo dos Problemas Detectados

Durante a análise, o Nikto identificou principalmente falhas de configuração de segurança, com destaque para a ausência ou má configuração de cabeçalhos HTTP. Esses cabeçalhos são importantes porque ajudam o navegador a proteger o usuário contra ataques comuns, como clickjacking, content sniffing e XSS, entre outros.

### Principais pontos encontrados:

---

### 2.1. X-Frame-Options ausente

- *Problema:*  
  A aplicação não envia o cabeçalho X-Frame-Options.

- *Risco:*  
  Permite que o site seja carregado dentro de um iframe em outro site malicioso → *Clickjacking*.

- *Impacto:*  
  Um atacante poderia criar uma página falsa sobreposta ao seu site e induzir o usuário a clicar em botões sem perceber.

---

### 2.2. X-Content-Type-Options inexistente

- *Problema:*  
  O cabeçalho X-Content-Type-Options: nosniff não está presente.

- *Risco:*  
  O navegador pode tentar adivinhar o tipo de conteúdo (MIME Sniffing), abrindo espaço para:
  - execução indevida de scripts  
  - interpretação de conteúdo como HTML quando não deveria

- *Impacto:*  
  Possível caminho para ataques como *XSS* via arquivos carregados no site.

---

### 2.3. Cabeçalho Refresh incomum

- *Problema:*  
  Um endpoint /uki2PGAd/ retorna o header:

- *Risco:*  
  Não é uma vulnerabilidade crítica, mas indica comportamento incomum na aplicação.

- *Impacto:*  
  Geralmente associado a *frameworks mal configurados* ou *rotas experimentais*.

### 2.4. Testes automáticos de payloads XSS

O Nikto tentou acessar URLs como:

- /node/view/666"><script>alert(document.domain)</script>

- /index.php/"><script><script>alert(document.cookie)</script><

- URLs extremamente longas com <script>alert(11)</script>

- Esses caminhos não existem na minha aplicação, mas o Nikto testa payloads conhecidos de aplicações antigas (Drupal, eZPublish, MyWebServer).
- O servidor retornou 404 isso é bom, significa que a minha aplicação não executou o script.


# Teste

## 1. O que é Clickjacking?

Clickjacking é um tipo de ataque que acontece sem o usuário perceber.

Na prática, funciona assim: um site malicioso consegue carregar o seu sistema dentro de um **iframe**. Esse iframe pode estar invisível, transparente ou até escondido atrás de algum botão chamativo.

A pessoa entra nesse site achando que está fazendo algo simples, como clicar em **“Ganhe R$ 100”**, **“Continuar”** ou qualquer outra coisa aparentemente inofensiva.  
Só que, por trás disso, o clique está sendo feito em **botões reais do seu sistema**.

Com isso, o usuário pode acabar, sem querer:

- excluindo um pedido  
- confirmando um pagamento  
- saindo da conta  
- autorizando alguma ação importante  

Ele acha que clicou em uma coisa, mas na verdade clicou em outra completamente diferente.

É daí que vem o nome **clickjacking**: o atacante basicamente “sequestra” o clique do usuário e usa isso contra ele.


## 2. O que é o Header X-Frame-Options?

O **X-Frame-Options** é um detalhe do HTTP que funciona como um aviso que o seu site manda para o navegador.

É como se o site dissesse:  
> “Olha, essa página pode (ou não) ser aberta dentro de um iframe.”

Quando esse aviso existe, o navegador já sabe o que fazer e bloqueia tentativas suspeitas. Quando não existe, o navegador simplesmente deixa passar.

Normalmente, esse header aparece com dois valores mais comuns:

- **DENY**  
   A página não pode ser carregada dentro de um iframe de jeito nenhum, venha de onde vier.

- **SAMEORIGIN**  
  Nesse caso, o iframe até é permitido, mas só se for do próprio site. Se vier de outro domínio, o navegador bloqueia.

O problema é quando esse header não está configurado (ou quando não existe nenhuma regra parecida).  
Sem essa proteção, qualquer site na internet pode tentar colocar a sua aplicação dentro de um iframe, e aí o caminho fica aberto para ataques de **clickjacking**.

## 3. Passo a passo de como fazer

A ideia do teste foi bem simples:

- Verificar se o site **aceitava ser carregado dentro de um iframe** (ou seja, se estava vulnerável);

---

### 3.1. Aplicação vulnerável

A aplicação que estava rodando em `http://localhost:3000` **não enviava o header X-Frame-Options**.

Na prática, isso quer dizer que o navegador não recebia nenhuma instrução dizendo  
“essa página não pode ser aberta dentro de um iframe”.

Quando isso acontece, o navegador assume que está tudo ok e permite.

Pra ter certeza, abrimos o **DevTools do navegador**, fomos na aba **Network**, clicamos na requisição da página e olhamos os **Headers**.  
E lá estava a confirmação: **o X-Frame-Options simplesmente não existia** na resposta.


---

### 3.2. Criando a página de teste

Depois disso, a gente simulou algo bem parecido com o que um atacante faria.

- Criamos um arquivo HTML simples, fora do projeto, chamado: **teste-clickjacking.html**. Esse arquivo basicamente carregava a aplicação dentro de um iframe.

O conteúdo do arquivo foi esse:

```

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Teste</title>
  </head>
  <body>
    <h1>Teste</h1>

    <iframe
      src="http://localhost:3000"
      style="width: 100%; height: 800px; border: 3px solid red;"
    ></iframe>
  </body>
</html>

```

- A ideia aqui é simples: mostrar que basta alguém criar uma página qualquer e apontar um iframe para o seu sistema

### 3.3. Resultado do teste

Quando abrimos o arquivo de teste, o comportamento foi bem claro.

A aplicação **carregou normalmente dentro do iframe**.

Não apareceu nenhum aviso, nenhum bloqueio, nada.  
Dava para usar o sistema como se estivesse aberto direto no site original: fazer login, clicar em botões e navegar pelas telas normalmente.

Isso deixa claro que, naquele momento, qualquer pessoa poderia:

- criar um site externo qualquer;
- colocar um iframe apontando para a aplicação;
- esconder esse iframe ou deixá-lo transparente;
- sobrepor botões ou elementos visuais falsos;
- e induzir o usuário a clicar em ações importantes sem nem perceber.








