import { Directive, HostListener, Input } from '@angular/core';
import { SharedModule } from '../../app/pages/general/shared/shared.module';

@Directive({
  selector: '[appInputSanitizer]',
})
export class InputSanitizerDirective {
  @Input('appInputSanitizer') sanitizerType: 'alphabet' | 'number' | 'alphanumeric' = 'alphabet';

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const input: string = event.target.value;
    let sanitizedValue: string = input;

    switch (this.sanitizerType) {
      case 'alphabet':
        sanitizedValue = input
          .split('')
          .filter((char: string) => SharedModule.isAlphabet(char))
          .join('');
        break;
        case 'number':
          sanitizedValue = input
            .split('')
            .filter((char: string) => SharedModule.isNumber(char))
            .join('');
          break;        
      case 'alphanumeric':
        sanitizedValue = input
          .split('')
          .filter((char: string) => SharedModule.isAlphanumeric(char))
          .join('');
        break;
    }

    event.target.value = sanitizedValue;
    event.target.dispatchEvent(new Event('input'));
  }

  validateDateField(dateValue: string, fieldName: string, isRequired: boolean): string | null {
    return SharedModule.validateDate(dateValue, fieldName, isRequired);
  }
}
