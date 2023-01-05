import { Component } from './base-component.js';
import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import { AutoBind } from '../decorators/auto-bind.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';

export class ProjectList
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

  @AutoBind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData('text/plain');

    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
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
