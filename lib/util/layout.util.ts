export class LayoutUtil {

  public static getWidth( element: HTMLElement ): number {
    let width = element.offsetWidth;
    let style = getComputedStyle( element );

    width -= parseFloat( style.paddingLeft ) + parseFloat( style.paddingRight ) + parseFloat( style.borderLeftWidth ) + parseFloat( style.borderRightWidth );
    return width;
  }

  public static getHeight( element: HTMLElement ): number {
    let height = element.offsetHeight;
    let style = getComputedStyle( element );

    height -= parseFloat( style.paddingTop ) + parseFloat( style.paddingBottom ) + parseFloat( style.borderTopWidth ) + parseFloat( style.borderBottomWidth );
    return height;
  }

  public static getOuterWidth( element: HTMLElement, margin: boolean = false ): number {
    let width = element.offsetWidth;

    if( margin ) {
      let style = getComputedStyle( element );
      width += parseFloat( style.marginLeft ) + parseFloat( style.marginRight );
    }

    return width;
  }

  public static getOuterHeight( element: HTMLElement, margin: boolean = false ): number {
    let height = element.offsetHeight;

    if( margin ) {
      let style = getComputedStyle( element );
      height += parseFloat( style.marginTop ) + parseFloat( style.marginBottom );
    }

    return height;
  }

  public static addClass( element: HTMLElement, className: string ) {
    if( element && className ) {
      if( element.classList ) {
        element.classList.add( className );
      }
      else {
        element.className += " " + className;
      }
    }
  }

  public static removeClass( element: HTMLElement, className: string ) {
    if( element && className ) {
      if( element.classList ) {
        element.classList.remove( className );
      }
      else {
        element.className = element.className.replace( new RegExp( "(^|\\b)" + className.split( " " ).join( "|" ) + "(\\b|$)", "gi" ), " " );
      }
    }
  }

  public static hasClass( element: HTMLElement, className: string ): boolean {
    if( element && className ) {
      if( element.classList ) {
        return element.classList.contains( className );
      }
      else {
        return new RegExp( "(^| )" + className + "( |$)", "gi" ).test( element.className );
      }
    }

    return false;
  }

}
