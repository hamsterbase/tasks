import { configMessages } from '../common/messages';

configMessages(localStorage.getItem('language') ?? navigator.language);
