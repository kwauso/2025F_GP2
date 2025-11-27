RG-thesis-template
=====
RGの卒論TeXテンプレート
## Files
```
```

## 以下以前のREADME
# Requirement

* 日本語対応の LaTeX2e が動作する環境
    * Linux - お使いのディストリビューションの標準ソフトウェアソースからインストール、または [TeX Live](http://www.tug.org/texlive/) をインストール
    * Mac OS X - [MacTeX](https://tug.org/mactex/) をインストール
    * Windows - [TeXインストーラ3](http://www.math.sci.hokudai.ac.jp/~abenori/soft/abtexinst.html) でインストール

* GNUMake

# Usage

## 1. このリポジトリをフォークする

このリポジトリを自分のアカウントにフォークしてください。  
フォークしたリポジトリに変更を push すると、このリポジトリは卒論PDFをダウンロードするURLを提供します。

## 2. Makefile を修正し、自分の環境に合わせる

Makefile 内のコマンドパスを自分の環境に合わせて変更してください。  
もし MacTeX を使用している場合は、以下のように TeXLive の "bin" ディレクトリを PATH に追加するだけで構いません。

```bash
export PATH = $PATH:/usr/local/texlive/20xx/bin/x86_64-darwin
```

さらに、MacTeX を使っている場合は、画像のバウンディングボックス情報ファイルを自動生成するため、以下の設定を LaTeX の設定ファイル（例: "/usr/local/texlive/texmf-local/web2c/texmf.cnf" — 初回は存在しない場合があります）に追加してください。

```tex
shell_escape_commands = \
bibtex,bibtex8,bibtexu,pbibtex,upbibtex,biber,\
kpsewhich,\
makeindex,mendex,texindy,\
mpost,pmpost,upmpost,\
repstopdf,epspdf,extractbb
```

## 3. 卒論を書く

* L編集する LaTeX ファイルは "src" ディレクトリにあります。
* 文献引用は "bib" ディレクトリ内のファイルを使用します。

## 4. "make" を実行して PDF を作成する

このリポジトリのルートディレクトリで GNU Make を実行すると、"thesis.pdf" のようなPDFが生成されます。

```bash
$ make
```

## 5. 卒論を公開して共有する

卒論をインターネット上に公開し、レビューを依頼できるようになります。
すべての変更をコミットし、フォークしたリポジトリの gh-pages ブランチへ push してください。

```bash
$ git add -u
$ git commit -m "Your commit message here."
$ git push origin gh-pages:gh-pages
```

これで、以下の URL から最新の卒論PDFを誰でもダウンロード・閲覧できます。
http://your_github_username.github.io/thesis/thesis.pdf now!
