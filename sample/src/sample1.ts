import * as ObjUiJs from 'objectuijs';

(function () {
    console.log('start');

    const wrapper = document.getElementsByTagName('html')[0];
    {
        let child;
        while ((child = wrapper.lastChild)) {
            child.remove();
        }
    }

    const newText = new ObjUiJs.element.DivElement();
    const text = new ObjUiJs.element.TextElement();
    text.setText('testtesttest');
    newText.addChild(text);

    newText.addToNode(wrapper);
    newText.style.color = 'red';

    const listener = new (class implements ObjUiJs.element.ClickEventListener {
        // クリックイベント
        onElementClickSingle(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {
            newText.deleteChild(text);
            console.log('click');

            const textx = new ObjUiJs.element.TextElement();
            const br = new ObjUiJs.element.BRElement();
            textx.setText('click');

            newText.addChild(textx);
            newText.addChild(br);
        }
        // ダブルクリックイベント
        onElementClickDBL(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
        // 第1ボタン以外のクリックイベント
        onElementClickAUX(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
    })();

    newText.setClickEventListener(listener);

    console.log('finish');
})();
