import { Directive, HostListener, Input } from '@angular/core';
import { SharedUtils } from '../../app/pages/general/shared/shared-utils'; // Import the utility functions
//import { SharedModule } from '../../app/pages/general/shared/shared.module';

@Directive({
  selector: '[appInputSanitizer]',
})
export class InputSanitizerDirective {
  @Input('appInputSanitizer') sanitizerType: 'alphabet' |'alphabetwithcomma'| 'number' | 'alphanumeric' = 'alphabet';

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const input: string = event.target.value;
    let sanitizedValue: string = input;

    switch (this.sanitizerType) {
      case 'alphabet':
        sanitizedValue = input
          .split('')
          .filter((char: string) => SharedUtils.isAlphabet(char))
          .join('');
        break;
        case 'alphabetwithcomma':
        sanitizedValue = input
          .split('')
          .filter((char: string) => SharedUtils.isAlphabetWithComma(char))
          .join('');
        break;
        case 'number':
          sanitizedValue = input
            .split('')
            .filter((char: string) => SharedUtils.isNumber(char))
            .join('');
          break;        
      case 'alphanumeric':
        sanitizedValue = input
          .split('')
          .filter((char: string) => SharedUtils.isAlphanumeric(char))
          .join('');
        break;
    }

    event.target.value = sanitizedValue;
    event.target.dispatchEvent(new Event('input'));
  }

  validateDateField(dateValue: string, fieldName: string, isRequired: boolean): string | null {
    return SharedUtils.validateDate(dateValue, fieldName, isRequired);
  }
}
