// Drag'n'Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus { Active, Finished }

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {
  }
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>): void {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();

    return this.instance;
  }

  addProject(title: string, description: string, people: number): void {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );

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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;
    this.element = document.importNode(this.templateElement.content, true).firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean): void {
    this.hostElement[insertAtBeginning ? 'prepend' : 'append'](this.element);
  }

  abstract configure(): void;

  abstract renderContent(): void;
}

//ProjectItem Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  get persons(): string {
    if (this.project.people === 1) {
      return '1 persons';
    }

    return `${this.project.people} persons`;
  }

  constructor(hostId: string, private project: Project) {
    super('single-project', hostId, false, project.id);

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent): void {
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);

  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();

      const listEl = this.element.querySelector('ul')!;

      listEl.classList.add('droppable');
    }
  }

  dropHandler(event: DragEvent): void {
    console.log(event.dataTransfer!.getData('text/plain'));
  }

  @AutoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;

    listEl.classList.remove('droppable');
  }


  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }

        return prj.status === ProjectStatus.Finished;
      });
      this.renderProjects();
    });
  }

  renderContent(): void {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;

    listEl.innerHTML = '';
    this.assignedProjects.forEach(prjItem => new ProjectItem(
      this.element.querySelector('ul')!.id,
      prjItem
    ));
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');