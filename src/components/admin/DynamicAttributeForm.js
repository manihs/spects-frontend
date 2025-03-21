import React, { useState, useEffect } from 'react';
import { Form, Select, Input, InputNumber, Switch } from 'antd';
import axios from 'axios';

const DynamicAttributeForm = ({ 
  selectedGroup, 
  onAttributeChange, 
  initialValues = {} 
}) => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      fetchAttributesByGroup(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchAttributesByGroup = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attributes/group/${groupId}`
      );

      if (response.data?.success && response.data?.data) {
        const selectedGroup = response.data.data.find(group => group.id === groupId);
        if (selectedGroup && Array.isArray(selectedGroup.attributes)) {
          setAttributes(selectedGroup.attributes);
        }
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (value) => {
    setAttributes([]);
    if (value) {
      fetchAttributesByGroup(value);
    }
  };

  const renderAttributeInput = (attribute) => {
    switch (attribute.type) {
      case 'options':
        return (
          <Select
            style={{ width: '100%' }}
            placeholder={`Select ${attribute.name}`}
            onChange={(value) => onAttributeChange(attribute.id, value)}
            defaultValue={initialValues[attribute.id]}
          >
            {attribute.options.map((option) => (
              <Select.Option key={option.id} value={option.value}>
                {option.value}
              </Select.Option>
            ))}
          </Select>
        );
      case 'multiple_select':
        return (
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={`Select ${attribute.name}`}
            onChange={(value) => onAttributeChange(attribute.id, value)}
            defaultValue={initialValues[attribute.id]}
          >
            {attribute.options.map((option) => (
              <Select.Option key={option.id} value={option.value}>
                {option.value}
              </Select.Option>
            ))}
          </Select>
        );
      case 'text':
        return (
          <Input
            placeholder={`Enter ${attribute.name}`}
            onChange={(e) => onAttributeChange(attribute.id, e.target.value)}
            defaultValue={initialValues[attribute.id]}
          />
        );
      case 'desc':
        return (
          <Input.TextArea
            rows={4}
            placeholder={`Enter ${attribute.name}`}
            onChange={(e) => onAttributeChange(attribute.id, e.target.value)}
            defaultValue={initialValues[attribute.id]}
          />
        );
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={`Enter ${attribute.name}`}
            onChange={(value) => onAttributeChange(attribute.id, value)}
            defaultValue={initialValues[attribute.id]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Form layout="vertical">
        {attributes.map((attribute) => (
          <Form.Item
            key={attribute.id}
            label={attribute.name}
            required={attribute.required}
          >
            {renderAttributeInput(attribute)}
          </Form.Item>
        ))}
      </Form>
    </div>
  );
};

export default DynamicAttributeForm; 