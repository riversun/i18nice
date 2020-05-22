/**
 * JavaScript Simple library for i18n(internationalisation)
 *
 * @type {i18nice}
 */
var i18nice =
  (function() {
      'use strict';

      /**
       * @constructor
       */
      function i18nice() {
        this.locale = "en";
        this.fallbackLocale = "ja";

        //Regexp for extracting all enclosed placeholder(like #{something}) in the text
        this.REGEXP_4_ALL_PLACEHOLDERS = /#{([\s\S]*?)}/g;

        //Regexp for extracting internal contents of placeholder(like #{something}) in the text
        this.REGEXP_4_PLACEHOLDER_CONTENT = /#{([\s\S]*?)}/;

        //Regexp for extracting all placeholder(like #{something}) for plural in the text
        this.REGEXP_4_ALL_NUMBER_PLACEHOLDERS = /\(\(([\s\S]*?)\)\)/g;

        //Regexp for extracting internal contents of placeholder(like #{something}) for plural in the text
        this.REGEXP_4_NUMBER_PLACEHOLDER_CONTENT = /\(\(([\s\S]*?)\)\)/;

        this.data = null

      }

      /**
       * Set locale like "en","ja"
       *
       * @param locale
       */
      i18nice.prototype.setLocale = function(locale) {
        var me = this;
        me.locale = locale;

      };

      /**
       * Set fallback locale
       * @param locale
       */
      i18nice.prototype.setFallback = function(locale) {
        var me = this;
        me.fallbackLocale = locale;
      };

      /**
       * Set multilingual resource(text) data

       * @param data
       */
      i18nice.prototype.init = function(data) {
        var me = this;
        me.data = data;
      };

      /**
       * Returns string for selected locale
       * @param sentenceId
       * @param param
       * @returns {string|*}
       */
      i18nice.prototype.t = function(sentenceId, param) {
        var me = this;
        return me._t(me.locale, sentenceId, param);
      };

      /**
       * Returns string for selected locale with sopecified locale
       * @param locale
       * @param sentenceId
       * @param param
       * @returns {*}
       * @private
       */
      i18nice.prototype._t = function(locale, sentenceId, param) {
        var me = this;

        if (me.data) {

          var resForLocale = me.data[locale];

          if (typeof (resForLocale) === "undefined") {
            // - If resource for specified local is not found
            return "";

          } else {

            var text = me.data[locale][sentenceId];

            if (typeof (text) === "undefined") {
              //- If no text for this locale was found

              if (me.fallbackLocale && me.fallbackLocale != locale) {

                // - If fallback local is specified AND fallback is different from current locale
                return me._t(me.fallbackLocale, sentenceId, param);

              } else {

                // - If fallback locale isn't specified
                return "";
              }

            }

            // replace a placeholder for number
            text = me.replaceForNumber(text, param, locale);

            // replace a placeholder for text
            text = me.replaceForNormal(text, param, locale);

            return text;
          }
        } else {
          return "";
        }

      };

      /**
       * Do replace placeholder for number
       *
       * Handle ((#{count} car|#{count} cars)) formatted placeholder
       *
       * @param text
       * @param param
       * @returns {void | string}
       */
      i18nice.prototype.replaceForNumber = function(text, param) {
        var me = this;

        var replacedStr = text.replace(me.REGEXP_4_ALL_NUMBER_PLACEHOLDERS, function(placeHolderForMultiple) {

          // "# {counter} car | # {counter} cars" part is extracted by the following code
          var contentOfPlaceHolderForMultiple = placeHolderForMultiple.match(me.REGEXP_4_NUMBER_PLACEHOLDER_CONTENT)[1];

          // splib by "|"
          var parts = contentOfPlaceHolderForMultiple.split("|");

          var zeroPart = "";
          var singularPart = "";
          var multiplePart = "";

          if (parts.length == 1) {

            // - When only one part is specified in ((something))

            //Regard the singular form and the plural form as the same
            singularPart = parts[0];
            multiplePart = singularPart;
          } else if (parts.length == 2) {
            // - When two parts are specified in (())
            // ==>Understand it as ((singular|plural))

            singularPart = parts[0];
            multiplePart = parts[1];

          } else if (parts.length == 3) {
            // - When three parts are specified in (())
            // ==>Understand it as ((zero|singular|plural))

            zeroPart = parts[0];
            singularPart = parts[1];
            multiplePart = parts[2];
          }

          // Get the value assigned to the first placeholder from the text containing the placeholder enclosed with "#{}"
          var numValue = me.getFirstValueEnclosedInBrackets(placeHolderForMultiple, param);

          if (isNaN(numValue)) {
            // - If the value is not a numeric value
            return me.replaceForNormal(singularPart, param);

          } else {

            // - If the value is numeric.

            if (parts.length == 3) {
              if (numValue == 0) {
                // - zero
                return me.replaceForNormal(zeroPart, param);
              } else if (numValue == 1) {
                // - singular
                return me.replaceForNormal(singularPart, param);
              } else {
                // - multiple
                //  (zero is treated plural in English)
                return me.replaceForNormal(multiplePart, param);

              }
            } else {
              if (numValue >= 2 || numValue == 0) {
                //-  when it is plural (zero is treated plural in English)
                return me.replaceForNormal(multiplePart, param);
              } else {
                // In case of singular
                return me.replaceForNormal(singularPart, param);
              }
            }
          }
        });


        return replacedStr;
      };

      /**
       * Replace the part enclosed with "#{} "like "#{user}"
       *
       * @param text
       * @param param
       * @returns {void | string}
       */
      i18nice.prototype.replaceForNormal = function(text, param, locale) {
        var me = this;
        var replacedStr = text.replace(me.REGEXP_4_ALL_PLACEHOLDERS, function(match) {

          // Get the contents enclosed with # {}
          var propName = match.match(me.REGEXP_4_PLACEHOLDER_CONTENT)[1];


          if (!param) {
            return "";
          }


          var value = param[propName];
          if (typeof (value) === "undefined") {
            value = "";

            // handle ordinal number
            var resForLocale = me.data[locale];
            if (resForLocale) {
              var candidateForOrdinal = resForLocale[propName];

              if (candidateForOrdinal && Array.isArray(candidateForOrdinal)) {
                const propertyNameOfOrdinalIndex = propName + "_index";
                if (Number.isInteger(param[propertyNameOfOrdinalIndex])) {
                  return candidateForOrdinal[param[propertyNameOfOrdinalIndex]];
                }
              }
            }

          }
          return value;
        });

        return replacedStr;
      };

      /**
       *
       * Get the value assigned to the first placeholder
       * @param text
       * @param param
       * @returns {*}
       */
      i18nice.prototype.getFirstValueEnclosedInBrackets = function(text, param) {
        var me = this;
        // Get the contents enclosed with # {}
        var propName = text.match(me.REGEXP_4_PLACEHOLDER_CONTENT)[1];
        var value = param[propName];
        return value;

      };

      //Normal Class
      return i18nice;
    }

  )();

module.exports = i18nice;