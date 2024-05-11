#!/bin/bash -e

# index.tsファイルを作成するsh

_EXEC_DIR=$(cd $(dirname $0) ; pwd)

# 対象のディレクトリにts,js,tsx,mjsファイルのいずれかが存在するかどうか
# 存在しない場合は空文字にする
function hasTsFile(){
    for __dir in $(cat -)
    do
        local count=`find "$__dir" -mindepth 1 -maxdepth 1 -type f | grep -E '\.(js|ts|tsx|mjs)$' | wc -l`
        if [ "$count" != '0' ];then
            echo "$__dir"
        fi
    done
}

# ディレクトリを指定してindex.tsファイルを作成
function create(){
    local __dir=$1
    cd "$__dir"

    local check=`echo '.' | hasTsFile`
    if [ "$check" == '' ];then
        echo 'fail:'"$__dir:$check"
        return 0
    fi

    for pathfile in `find "$__dir" -mindepth 1 -maxdepth 1 -type d`; do
        create "$pathfile"
    done

    cd "$__dir"

    touch 'index.ts'
    rm 'index.ts'
    touch 'index.ts'

    find . -mindepth 1 -maxdepth 1 -type f \
        | grep -E '^\./[^./]+\.(js|ts|tsx|mjs)$' \
        | grep -v -E '^\./index.ts$' \
        | sed -E 's#^(\./[^./]+)\.(js|ts|tsx|mjs)$#\1#g' \
        | xargs -I flnm echo "export * from 'flnm';" >> 'index.ts'

    find . -mindepth 1 -maxdepth 1 -type d \
        | hasTsFile \
        | xargs -I dirnm echo "export * from 'dirnm/index';" >> 'index.ts'
}

# topディレクトリのindex.tsを作成する
function createTop(){
    local __dir=$1
    cd "$__dir"

    for pathfile in `find "$__dir" -mindepth 1 -maxdepth 1 -type d`; do
        create "$pathfile"
    done

    cd "$__dir"

    touch 'index.ts'
    rm 'index.ts'
    touch 'index.ts'

    find . -mindepth 1 -maxdepth 1 -type d \
        | hasTsFile \
        | sed -E 's#^\./([^./]+)$#\1#g' \
        | xargs -I dirnm echo "export * as dirnm from './dirnm/index';" >> 'index.ts'
}

createTop "$_EXEC_DIR/src"

## find . -type f | grep -E 'index\.ts$' | xargs rm
## ↑index.tsの削除
