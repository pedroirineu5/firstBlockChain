# First Blockchain
Uma blockchain simples sem mineração, implementada em Node.JS para testar tudo que foi aprendido no último módulo do projeto de bolsas da compass UOL. 

## pré requisitos
- ⚠ [Node.js v20.18.0LTS](https://nodejs.org/en)

## Para rodar o projeto
No seu diretório escolhido, abra o terminal e digite em sequência os seguintes comandos:

para clonar o repositório do projeto em sua máquina local.
```bash
git clone https://github.com/pedroirineu5/firstBlockChain.git
```

para instalar as dependências do projeto

```bash
npm install
```

 e por fim, para rodar o arquivo `index.js` basta digitar

```bash
node index.js
```


# Explicação Detalhada do Código

O código simula um blockchain básico, incluindo funções como a mineração de blocos, transações, monitoramento de saldos e comunicação entre nós (nodes).

---

## **1. Classe `Block`**
Simboliza um bloco na rede blockchain.


### **`constructor(timestamp, transactions, previousHash = '')`**
- Cria um bloco novo contendo:
- 'timestamp': Hora de criação.
- `operations`: Conjunto de operações.
- `previousHash`: Hash do bloco imediatamente anterior.
- Define `nonce` para 0 e determina o hash inicial. Representa um bloco na blockchain.


### **`calculateHash()`**
- Devolve o hash obtido a partir de:
- `date`
- `hash anterior`
- Operações (serializadas em formato JSON).
"nonce".


### **`mineBlock(difficulty, minerAddress)`**
- Realiza a atividade de mineração:
- Eleva `nonce` até que o hash comece com a quantidade de zeros estabelecida por `difficulty` definida.
- Determina os custos totais das transações e gera uma transação de gratificação para o minerador.
O bloco é adicionado à transação de recompensa.


### **`toString()`**
- Retorna uma representação formatada do bloco e suas transações.

---

## **2. Classe `Transaction`**
Representa uma transação no sistema.

### **`constructor(amount, emissor, destinatário, fee = 0)`**
Estabelece uma operação com:
- `amount`Valor transferido.
- `sender`: Localidade do destinatário.
- `destination`: Localidade do destinatário.
- `fee`: Cobrança pela transação (facultativa).

### **`verifyBalanceSender()`**
- Verifica se o remetente possui saldo suficiente para realizar a transação (incluindo a taxa).
- Retorna `true` para transações de recompensa (`sender === null`).

### **`toString()`**
- Retorna uma string representando os detalhes da transação.

---

## **3. Classe `Wallet`**
Simula uma carteira digital.

### **`constructor()`**
- Gera uma nova carteira com:
  - `address`: Endereço gerado usando `CryptoJs.SHA256`.

---

## **4. Classe `BalanceTracker`**
Gerencia os saldos dos endereços.

### **`updateBalances(transactions, minerAddress)`**
- Atualiza saldos:
  - Deduz o valor e a taxa do remetente.
  - Adiciona o valor ao destinatário.
  - Credita a taxa ao minerador.

### **`getBalance(address)`**
- Retorna o saldo de um endereço (0 se não existir).

### **`addInitialBalance(address, amount)`**
- Adiciona um saldo inicial a um endereço.

---

### ***5. Categoria 'Blockchain'**
Administra a sequência de blocos.

 **`constructor()`** 
- Desenvolve a blockchain utilizando:
Um bloco de origem (o início da cadeia).
- Operações em andamento.
- Padrão de dificuldade para a mineração.

**`createGenesisBlock()` 
- Cria o bloco de origem com um hash inicial de zero.

 **`obterBlocoRecente()`**
- Retorna o bloco final da sequência.

**`addBlock(minerAddress)`** 
- Cria e insere um bloco novo:
- Abrange as transações em andamento.
- Executa a extração mineral.
- Atualiza os registros de transações e contas em aberto.
- Elimina as transações em atraso.

**`createTransaction(transaction)`**
- Inclui uma transação em andamento:
- Confere se os endereços estão corretos.
- Verifica o saldo do destinatário.
- Inclui na lista de transações em andamento.

**`isValidAddress(address)`**
- Verifica a validade do endereço (não pode ser vazio e do tipo string).

**`isChainValid()`**
- Confirma a sequência:
- Verifica a precisão do hash de cada bloco.
- Examina a integridade da sequência (`previousHash`).


---

## **6. Classe `AddressHistory`**
Mantém o histórico de transações por endereço.

### **`addTransaction(transaction)`**
- Adiciona uma transação ao histórico de remetente e destinatário.

### **`getHistory(address)`**
- Retorna o histórico de transações de um endereço.

---

## **7. Classe `Node`**
Representa um nó na rede.

### **`constructor(blockchain)`**
- Inicializa o nó com uma instância de blockchain e uma lista de peers (outros nós).

### **`addPeer(peer)`**
- Adiciona outro nó como peer.

### **`broadcastTransaction(transaction)`**
- Envia uma transação para todos os peers.

### **`broadcastBlock(block)`**
- Envia um bloco para todos os peers.

### **`receiveTransaction(transaction)`**
- Recebe uma transação e a adiciona à blockchain local.

### **`receiveBlock(block)`**
- Recebe um bloco:
  - Valida o bloco.
  - Resolve possíveis bifurcações (forks) na cadeia.

### **`resolveFork(newBlock)`**
- Resolve conflitos na cadeia:
  - Adota a cadeia mais longa e válida.

### **`isChainValid(chain)`**
- Valida uma cadeia de blocos.

---
