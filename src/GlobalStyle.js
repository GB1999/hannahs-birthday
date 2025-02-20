// GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Bartex';
    src: url('/fonts/Bartex-Regular.ttf') format('ttf');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
  font-family: 'CaviarDreams';
  src: url('/fonts/CaviarDreams.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'CaviarDreams_Bold';
  src: url('/fonts/CaviarDreams_Bold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

  /* Optionally set your entire app to use the font */
  body {
    margin: 0;
    font-family: 'MyCustomFont', sans-serif;
  }
`;
