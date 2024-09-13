# FinTrack - Cuidando de suas finanças!

FinTrack é um site e aplicativo de gestão financeira projetado para ajudar os usuários a acompanhar e gerenciar suas finanças pessoais de maneira eficiente e intuitiva.

## Apresentação Slides:

https://my.visme.co/view/pvpe8yyo-fintrack

## Tecnologias Utilizadas

| Teconologias               | Linguagens |               
| ----------------- | -------------|
| Front-end      |  JavaScript, Bootstrap, HTML e CSS |
| Back-end       |  Node, Express, Prisma e JWT |
| Teste       |  Insomnia |
| Back e Front     |  VsCode |
  Banco      |   Xampp e Prisma
| Mobile | React, Yarn, Expo | 

## Instalação Web

1. Clone este repositorio e abra com o VsCode:

```bash
 https://github.com/lehhofman/FinTrack-Financas.git
```
2. Entre na pasta api:
```bash
  cd api
```
3. Crie um arquivo .env contendo:
```bash
  DATABASE_URL="mysql://root:@localhost:3306/FinTrack"
  KEY="base64q3
```
4. Abra o Xampp e inicie o mysql e o apache 
5. Inicie e instale as dependencias e o banco de dados no VsCode:
```bash
  npm i
  npx prisma migrate dev --name fintrack init
```
6. Execute a api:
```bash
  nodemon
```

## Instalação Mobile

1. Clone este repositorio e abra com o VsCode:

```bash
  git clone https://github.com/Carla-coder/proj1.git
```

2. Inicie o projeto:

```bash
  yarn install
```

3. Instale as dependencias: 
```bash
  yarn add @react-navigation/native
  yarn add @react-navigation/bottom-tabs
  yarn add @react-navigation/stack
  yarn add @expo/vector-icons@react-native-picker/picker
  yarn add @react-native-async-storage/async-storage
  yarn add react-native-vector-icons/FontAwesome
  yarn add validator
  yarn add react-native-chart-kit

```

3. Execute o projeto:
```bash
  yarn start
```
## Documentação de cores

| Cor               | Hexadecimal |               
| ----------------- | -------------|
| Cor 1       |  #c2be99 |
| Cor 2       |  #ceceb1 |
| Cor 3       |  #284767 |
| Cor 4       |  #376f7b |
  Cor 5       |   #7ebab6

## Protótipo

O protótipo do projeto pode ser visualizado [neste link do Figma](https://www.figma.com/proto/4tw77ZcwhrmvqBoFfoC385/FinTrack?node-id=0-1&t=sBvlsGLJ3tiAyYAH-1).

## Wireframes

![Wireframe](Img/FinTrack.png)
