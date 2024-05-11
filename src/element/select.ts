/*
selectとoptgroupとoptionのElement
*/
import * as FormItem from './form_item';
import * as Html from './html';

type gSelect = globalThis.HTMLSelectElement;
type gOption = globalThis.HTMLOptionElement;
type gOptGroup = globalThis.HTMLOptGroupElement;

// オプションElement
export class OptionElement extends Html.HTMLElementVariable<gOption> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLOptionElement());
    }

    // ラベルと値を設定する
    public setLabelValue(label: string, value: string): void {
        this.htmlVariable.setAttribute('value', value);
        this.htmlVariable.textContent = label;
    }
}

// optGroup Element
export class OptGroupElement extends Html.HTMLElementVariable<gOptGroup> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLOptGroupElement());
    }

    // ラベルを設定する
    public setLabel(label: string): void {
        this.htmlVariable.setAttribute('label', label);
    }
}

// デフォルトオプションのプロパティの基底クラス
abstract class CanDefaultOptionProp {
    // オプションを作成する
    abstract createOption(): OptionElement | OptGroupElement;
}

// デフォルトのオプションのプロパティ
export class DefaultOptionProp extends CanDefaultOptionProp {
    protected label: string;
    protected value: string;

    // コンストラクタ
    public constructor(label: string, value: string) {
        super();
        this.label = label;
        this.value = value;
    }

    // オプションを作成する
    public createOption(): OptionElement | OptGroupElement {
        const newOption = new OptionElement();
        newOption.setLabelValue(this.label, this.value);
        return newOption;
    }
}

// デフォルトのオプショングループのプロパティ
export class DefaultOptGroupProp extends CanDefaultOptionProp {
    protected defaultOptionPropList: Array<DefaultOptionProp>;
    protected label: string;

    // コンストラクタ
    public constructor(label: string, defaultOptionPropList: Array<DefaultOptionProp> = []) {
        super();
        this.label = label;
        this.defaultOptionPropList = defaultOptionPropList;
    }

    // オプションを作成する
    public createOption(): OptionElement | OptGroupElement {
        const newOptGroup = new OptGroupElement();
        newOptGroup.setLabel(this.label);
        this.defaultOptionPropList.forEach((optProp) => {
            const newOpt = optProp.createOption();
            newOptGroup.addChild(newOpt);
        });
        return newOptGroup;
    }
}

// セレクトElement
export class SelectElement extends FormItem.FormItemElementVariable<gSelect> {
    // コンストラクタ
    public constructor(formItemProp: FormItem.FormItemProp = new FormItem.FormItemProp()) {
        const input = new globalThis.HTMLSelectElement();
        super(input);

        this.setFormItemProp(formItemProp);
    }

    // デフォルトプロパティからオプションの設置
    public setOptionListByProp(optPropList: Array<CanDefaultOptionProp>): void {
        optPropList.forEach((opt) => {
            const newOpt = opt.createOption();
            this.addChild(newOpt);
        });
    }
}
