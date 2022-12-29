class ProjectInput {
  templateElement = document.getElementById('project-input') as HTMLTemplateElement;
  hostElement = document.getElementById('app') as HTMLElement;
  element = document
    .importNode(this.templateElement.content, true)
    .firstElementChild as HTMLFormElement;

  constructor() {
    this.attach();
  }

  private attach(): void {
    this.hostElement.prepend(this.element);
  }
}

const prjInput = new ProjectInput();