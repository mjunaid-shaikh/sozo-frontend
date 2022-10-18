import { CONFIGS } from '../../CONFIG';

const SELECTED_CONFIG = CONFIGS.DEV;

export class CONSTANTS {
  static PATTERNS = {
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,3}$/i,
    alphabets: /[A-z]/,
    alphanumeric: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
    number: /^[0-9]*$/,
    amountWithoutDecimals: /^[0-9$]*$/,
    fullName: /^[a-z]([-']?[a-z]+)*( [a-z]([-']?[a-z]+)*)+$/,
    password: /^'((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})/,
  };

  static BASE_URL = SELECTED_CONFIG.BASE_URL;
  static SOCKET_BASE_URL = SELECTED_CONFIG.SOCKET_BASE_URL;
  static CLIENT_BASE_URL = SELECTED_CONFIG.CLIENT_BASE_URL;

  public static TECHNICAL_ERROR = 'Error Occurred. Please Contact Helpdesk.';
  public static API_SUCCESS = 'success';
  public static API_ERROR = 'error';

}
