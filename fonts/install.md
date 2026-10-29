paste on custom stylesheet

```

@font-face {

   font-family: 'bootstrap-icons';
   
   src: url('fonts/bootstrap-icons.woff2') format('woff2'),
        url('fonts/bootstrap-icons.woff') format('woff');
         
   font-weight: normal;
    
   font-style: normal;
    
   font-display: swap;
    
}

```

Clases base obligatorias para que funcionen los iconos localmente 
```
.bi {
    display: inline-block;
    font-family: 'bootstrap-icons';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: -.125em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```
