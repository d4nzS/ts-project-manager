import { Component } from './base-component';
import { Validatable, validate } from '../utils/validation';
import { AutoBind } from '../decorators/auto-bind';
import { projectState } from '../state/project-state';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
  descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
  peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.configure();
  }

  configure(): void {
    this.element.onsubmit = this.submitHandler;
  }

  renderContent(): void {
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
}