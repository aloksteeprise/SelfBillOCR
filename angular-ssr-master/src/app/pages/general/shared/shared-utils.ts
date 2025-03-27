export class SharedUtils {
    static isAlphabet(value: string): boolean {
      return /^[a-zA-Z\s]*$/.test(value);
    }
  
    static isAlphabetWithComma(value: string): boolean {
      return /^[a-zA-Z\s,]*$/.test(value);
    }
  
    static isNumber(value: string): boolean {
      return /^\d*\.?\d*$/.test(value);
    }
  
    static isAlphanumeric(value: string): boolean {
      return /^[a-zA-Z0-9\s\-\#]*$/.test(value);
    }
  
    static validateDate(dateValue: string, fieldName: string, isRequired: boolean): string | null {
      const today = new Date();
      if (!dateValue || dateValue.trim() === '') {
        
        return isRequired ? `${fieldName} is required.` : null;
      }
  
      const inputDate = new Date(dateValue);
      const year = inputDate.getFullYear();
  
      if (isNaN(inputDate.getTime())) {
        return `Invalid date format for ${fieldName}. Please enter a valid date.`;
      }
  
      if (year < 1900) {
        return `Invalid ${fieldName}.`;
      }
  
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // if (inputDate >= nextMonth) {
      //   return `${fieldName} cannot be in the future.`;
      // }
  
      return null; // Date is valid
    }
  }
  