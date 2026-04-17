declare module '*.hbs?raw' {
    const content: string;
    export default content;
}

declare module '*.hbs' {
    import { TemplateDelegate } from 'handlebars';
    const template: TemplateDelegate;
    export default template;
}