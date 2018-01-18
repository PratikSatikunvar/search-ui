import { IStringMap } from '../rest/GenericParam';
import { each } from 'underscore';

export class SVGDom {
  public static addClassToSVGInContainer(svgContainer: HTMLElement, classToAdd: string) {
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('class', `${SVGDom.getClass(svgElement)}${classToAdd}`);
    }
  }

  public static removeClassFromSVGInContainer(svgContainer: HTMLElement, classToRemove: string) {
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('class', SVGDom.getClass(svgElement).replace(classToRemove, ''));
    }
  }

  public static addStyleToSVGInContainer(svgContainer: HTMLElement, styleToAdd: IStringMap<any>) {
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      each(styleToAdd, (styleValue, styleKey) => {
        (<any>svgElement.style)[styleKey] = styleValue;
      });
    }
  }

  private static getClass(svgElement: SVGElement) {
    const className = svgElement.getAttribute('class');
    return className ? className + ' ' : '';
  }
}
