import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface FlashcardFormData {
  front: string;
  back: string;
  deck: string;
  tags: string[];
}

const schema = yup.object().shape({
  front: yup.string().required('Front content is required'),
  back: yup.string().required('Back content is required'),
  deck: yup.string().required('Deck name is required'),
  tags: yup.array().of(yup.string()).default([]),
});

interface FlashcardEditorProps {
  initialData?: FlashcardFormData;
  onSubmit: (data: FlashcardFormData) => void;
  isSubmitting?: boolean;
}

export default function FlashcardEditor({ initialData, onSubmit, isSubmitting = false }: FlashcardEditorProps) {
  const [newTag, setNewTag] = useState('');
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FlashcardFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      front: initialData?.front || '',
      back: initialData?.back || '',
      deck: initialData?.deck || '',
      tags: initialData?.tags || [],
    },
  });

  const tags = watch('tags');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="deck"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Deck Name"
                  error={!!errors.deck}
                  helperText={errors.deck?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="front"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Front"
                  multiline
                  rows={3}
                  error={!!errors.front}
                  helperText={errors.front?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="back"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Back"
                  multiline
                  rows={3}
                  error={!!errors.back}
                  helperText={errors.back?.message}
                  fullWidth
                />
              )}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </Box>
    </form>
  );
}
