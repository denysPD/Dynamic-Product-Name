define([
    'Magento_Ui/js/form/element/abstract',
    'underscore',
    'uiRegistry',
    'mage/translate',
    'KozakGroup_Vsf/js/helper/component'
], function (Abstract, _, registry, $t, componentHelper) {
    'use strict';

    return Abstract.extend({
        defaults: {
            allowImport: true,
            autoImportIfEmpty: false,
            values: {},
            mask: '',
            queryTemplate: 'ns = ${ $.ns }, index = ',
            configForElements: {
                team_name: {
                    after: ' '
                },
                season_start: {
                    after: ' '
                },
                season_end: {
                    before: '- ',
                    after: ' '
                },
                special_text: {
                    after: " "
                },
                kit_type: {
                    after: ' '
                },
                clothes_type: {
                    after: ' '
                },
                number: {
                    before: '#',
                    after: ' '
                },
                name_player: {
                    after: ' '
                },
                condition: {
                    before: '(',
                    after: ') '
                }
            }
        },

        /** @inheritdoc */
        initialize: function () {
            this._super();
            this.setHandlers();
        },

        /**
         * Split mask placeholder and attach events to placeholder fields.
         */
        setHandlers: function () {
            var str = this.mask || '',
                placeholders;

            placeholders = str.match(/{{(.*?)}}/g); // Get placeholders

            _.each(placeholders, function (placeholder) {
                placeholder = placeholder.replace(/[{{}}]/g, ''); // Remove curly braces

                registry.get(this.queryTemplate + placeholder, function (component) {
                    this.values[placeholder] = component.getPreview();
                    component.on('value', this.updateValue.bind(this, placeholder, component));
                    component.valueUpdate = 'keyup';
                }.bind(this));
            }, this);
        },

        /**
         * Update field with mask value, if it's allowed.
         *
         * @param {Object} placeholder
         * @param {Object} component
         */
        updateValue: function (placeholder, component) {
            var string = this.mask || '',
                nonEmptyValueFlag = false;

            if (placeholder) {
                this.values[placeholder] = componentHelper.getComponentPreview(component);
            }

            if (!this.allowImport) {
                return;
            }

            _.each(this.values, function (propertyValue, propertyName) {
                string = this.generateValueWithConfig(propertyName, propertyValue, string);

                nonEmptyValueFlag = nonEmptyValueFlag || !!propertyValue;
            }, this);

            if (nonEmptyValueFlag) {
                string = string.replace(/(<([^>]+)>)/ig, ''); // Remove html tags
                this.value(string);
            } else {
                this.value('');
            }
        },

        /**
         *  Callback when value is changed by user,
         *  and disallow/allow import value
         */
        userChanges: function () {

            /**
             *  As userChanges is called before updateValue,
             *  we forced to get value from component by reference
             */
            var actualValue = arguments[1].currentTarget.value;

            this._super();

            if (actualValue === '') {
                this.allowImport = true;

                if (this.autoImportIfEmpty) {
                    this.updateValue(null, null);
                }
            } else {
                this.allowImport = false;
            }
        },

        /**
         * Some fields my have something near them if they exist
         * @param propertyName
         * @param propertyValue
         * @param string
         * @returns {*}
         */
        generateValueWithConfig: function (propertyName, propertyValue, string) {
            var elemConfig = this.configForElements[propertyName];

            if (propertyValue === $t('No season')) {
                propertyValue = '';
            } else if (propertyValue && 'undefined' !== typeof elemConfig) {
                _.each(elemConfig, function (configValue, configType) {
                    switch (configType) {
                        case 'before':
                            propertyValue = configValue + propertyValue;
                            break;
                        case 'after':
                            propertyValue += configValue;
                            break;
                    }
                });
            }
            string = string.replace('{{' + propertyName + '}}', propertyValue);
            return string;
        }
    });
});