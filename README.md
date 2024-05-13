# ObjectUIjs
オブジェクト志向でのUI作成のライブラリ

# セットアップ
1. nvmのインストール
```bash
sudo apt update -y
sudo apt install -y curl

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
```

2. node.jsのインストール
```bash
nvm install --lts --latest-npm
nvm alias default 'lts/*'
```

3. typescript prettierのインストール
```bash
npm install -D typescript prettier

# typescriptの初期化
npx tsc --init
```

# フォーマット
- このディレクトリから以下のコマンドでフォーマットする
- prettierを使用したフォーマットを行う
- フォーマットルールは[.prettierrc.json](./.prettierrc.json)に記載
```bash
npm run format
```

# コンパイル
- `npm run build`でコンパイルを行う
- `./dist`ディレクトリにコンパイル結果が格納される
