// AutoBind decorator
function AutoBind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return {
    get() {
      return descriptor.value.bind(this);
    }
  };
}

// ProjectInput class
class ProjectInput {
  templateElement = document.getElementById('project-input') as HTMLTemplateElement;
  hostElement = document.getElementById('app') as HTMLElement;
  element = document
    .importNode(this.templateElement.content, true)
    .firstElementChild as HTMLFormElement;
  titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
  descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
  peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

  constructor() {
    this.element.id = 'user-input';

    this.configure();
    this.attach();
  }

  @AutoBind
  private submitHandler(event: Event): void {
    event.preventDefault();
  }

  private configure(): void {
    this.element.onsubmit = this.submitHandler;
  }

  private attach(): void {
    this.hostElement.prepend(this.element);
  }
}

const prjInput = new ProjectInput();