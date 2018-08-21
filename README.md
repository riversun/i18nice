# Overview
"i18nice" is an internationalization library written in JavaScript.
It provides a simple and easy way to handle i18n (interpolation,plural)."i18nice" has zero dependencies. 

It is licensed under [MIT license](https://opensource.org/licenses/MIT).

# Quick start
## view demo on the web
https://riversun.github.io/i18nice/index.html

## run demo on node.js

**clone this project and type as follows**

```shell
npm start
```

## download standalone js file

You can import standalone js into your front-end app on the browser with &lt;script&gt; tag.

https://raw.githubusercontent.com/riversun/i18nice/master/dist/i18nice.js

## install via npm

```shell
npm install i18nice
```

## Usage

### Instantiation

First, create an instance of the `i18nice` class, which you will use for translation.

```js
var i18n = new i18nice();
 
```

### Translation

i18nice.t() provides translation. 

```js
i18n.init({
    en: {
        hello: "Hello.",
    },
    ja: {
        hello: "こんにちは。",
    }
});

i18n.setLocale("en");
i18n.t("hello");
 => "Hello."

i18n.setLocale("ja");
i18n.t("hello");
 => "こんにちは。"
 
```

### Interpolation

i18nice.t() also provides interpolation. 
    
```js

i18n.init({
    en: {
        hello: "Hi,#{user1}.",
    },
    ja: {
        hello: "#{user1}さん、こんにちは。",
    }
});

i18n.setLocale("en");

i18n.t("hello", {user1:"Tom"});
 =>"Hi,Tom!"

```

### Pluralization

You can use ((case of single | case of multiple)) for pluralization.

```js
i18n.init({
    en: {
        cars: "You have ((#{numCar} car|#{numCar} cars)).",
    }
});

i18n.t("cars", {numCar:0});
 =>"You have 0 cars."

i18n.t("cars", {numCar:1});
 =>"You have 1 car."
 
i18n.t("cars", {numCar:2});
 =>"You have 2 cars."
 
 
```

Also you can use ((case of zero | case of single | case of multiple)) for pluralization.

```js
i18n.init({
    en: {
        cars: "You have ((no car|a car|#{numCar} cars)).",
    }
});

i18n.t("cars", {numCar:0});
 =>"You have no car."

i18n.t("cars", {numCar:1});
 =>"You have a car."
 
i18n.t("cars", {numCar:2});
 =>"You have 2 cars."
 
 
```

### Fallback locale

```js
i18n.setFallback("en");
```

