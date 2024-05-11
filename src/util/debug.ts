/*
デバッグ用の処理
*/

// デバッグonかどうかのステータス
export const DEBUG = true;

export const log = function (log: any): void {
    if (DEBUG) {
        console.log(log);
    }
};

export const exe = function (func: () => void): void {
    if (DEBUG) {
        func();
    }
};

export const trace = function (): void {
    if (DEBUG) {
        console.trace();
    }
};
