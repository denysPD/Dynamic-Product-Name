<?php

namespace KozakGroup\DynamicProductName\Ui\DataProvider\Product\Form\Modifier;

use Magento\Framework\Stdlib\ArrayManager;
use Magento\Catalog\Ui\DataProvider\Product\Form\Modifier\AbstractModifier;
use Magento\Framework\App\Config\ScopeConfigInterface;

/**
 * Data provider for main panel of product page
 *
 * @api
 * @since 101.0.0
 */
class ProductName extends AbstractModifier
{

    /**
     * @var ArrayManager
     */
    protected $_arrayManager;

    /**
     * @var ScopeConfigInterface
     */
    protected $_scopeConfig;

    /**
     * @param ArrayManager                $arrayManager
     * @param ScopeConfigInterface        $scopeConfig
     */
    public function __construct(
        ArrayManager $arrayManager,
        ScopeConfigInterface $scopeConfig
    ) {
        $this->_arrayManager = $arrayManager;
        $this->_scopeConfig = $scopeConfig;
    }

    public function modifyMeta(array $meta)
    {
        $meta = $this->_customiseNameAttrField($meta);
        return $meta;
    }

    public function modifyData(array $data)
    {
        return $data;
    }

    protected function _customiseNameAttrField(array $meta)
    {
        $elementPath = $this->_arrayManager->findPath(
            'name',
            $meta
        );

        if (empty($elementPath)) {
            return $meta;
        }

        $meta = $this->_arrayManager->merge($elementPath, $meta, [
            'arguments' => [
                'data' => [
                    'config' => [
                        'mask' => $this->_scopeConfig->getValue('catalog/fields_masks/name'),
                        'allowImport' => true,
                        'component' => 'KozakGroup_DynamicProductName/js/components/import-handler',
                        'valueUpdate' => 'keyup',
                        'autoImportIfEmpty' => true,
                    ],
                ],
            ],
        ]);

        return $meta;
    }



}