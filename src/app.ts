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

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      !enteredTitle.trim() ||
      !enteredDescription.trim() ||
      !enteredPeople.trim()
    ) {
      alert('Invalid input, please try again');

      return;
    }

    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs(): void {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @AutoBind
  private submitHandler(event: Event): void {
    event.preventDefault();

    const userInput = this.gatherUserInput();

    if (userInput) {
      const [title, desc, people] = userInput;

      this.clearInputs();
      console.log(title, desc, people);
    }
  }

  private configure(): void {
    this.element.onsubmit = this.submitHandler;
  }

  private attach(): void {
    this.hostElement.prepend(this.element);
  }
}

const prjInput = new ProjectInput();