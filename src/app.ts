// Project State Management

class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();

    return this.instance;
  }

  addListener(listenerFn: Function): void {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number): void {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      people
    };

    this.projects.push(newProject);
    this.listeners.forEach(listenerFn => listenerFn(this.projects.slice()));
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable): boolean {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && !!validatableInput.value.toString().trim();
  }

  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.trim().length >= validatableInput.minLength;
  }

  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.trim().length <= validatableInput.maxLength;
  }

  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

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

// ProjectList class
class ProjectList {
  templateElement = document.getElementById('project-list') as HTMLTemplateElement;
  hostElement = document.getElementById('app') as HTMLElement;
  element = document.importNode(this.templateElement.content, true).firstElementChild as HTMLElement;
  assignedProjects: any[] = [];

  constructor(private type: 'active' | 'finished') {
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;

    this.assignedProjects.forEach(prjItem => {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;

      listEl.append(listItem);
    });
  }

  private renderContent(): void {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach(): void {
    this.hostElement.append(this.element);
  }
}

// ProjectInput class
class ProjectInput {
  templateElement = document.getElementById('project-input') as HTMLTemplateElement;
  hostElement = document.getElementById('app') as HTMLElement;
  element = document.importNode(this.templateElement.content, true).firstElementChild as HTMLFormElement;
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

    const titleValidatable: Validatable = {
      value: this.titleInputElement.value,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: this.descriptionInputElement.value,
      required: true
    };
    const peopleValidatable: Validatable = {
      value: +this.peopleInputElement.value,
      required: true,
      min: 1,
      max: 5
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
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

      projectState.addProject(title, desc, people);
      this.clearInputs();
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
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');