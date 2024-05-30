/**
 * サンプルのエントリーポイント
 */
import { Top, HeaderContentPair, BaseTopHeader } from './component';
import { Page1 } from './pages/page1';
import { Page2 } from './pages/page2';
import { Page3 } from './pages/page3';
import { Page4 } from './pages/page4';
import { Page5 } from './pages/page5';
import { Page6 } from './pages/page6';
import { Page7 } from './pages/page7';
import { Page8 } from './pages/page8';
import { Page9 } from './pages/page9/page9';

console.log('start');

// 表示領域
const wrapper = document.getElementsByTagName('body')[0];
{
    let child;
    while ((child = wrapper.lastChild)) {
        child.remove();
    }
}

const toppage = new Top([
    new HeaderContentPair(new BaseTopHeader('ヘッダー1'), new Page1()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー2'), new Page2()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー3'), new Page3()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー4'), new Page4()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー5'), new Page5()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー6'), new Page6()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー7'), new Page7()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー8'), new Page8()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー9'), new Page9()),
]);

toppage.addToNode(wrapper);

console.log('end');
