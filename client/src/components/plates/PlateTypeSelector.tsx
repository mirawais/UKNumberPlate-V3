import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PlateTypeSelectorProps {
  plateType: 'both' | 'front' | 'rear';
  onChange: (value: 'both' | 'front' | 'rear') => void;
  isRoadLegal: boolean;
}

const PlateTypeSelector = ({ plateType, onChange, isRoadLegal }: PlateTypeSelectorProps) => {
  const idPrefix = isRoadLegal ? '' : 'show-';

  return (
    <div className="p-4 border-b">
      <RadioGroup 
        defaultValue="both" 
        value={plateType}
        onValueChange={(value) => onChange(value as 'both' | 'front' | 'rear')}
        className="flex justify-between gap-2"
      >
        <div className="relative w-1/3">
          <RadioGroupItem value="both" id={`${idPrefix}both-plates`} className="sr-only" />
          <Label 
            htmlFor={`${idPrefix}both-plates`} 
            className={`relative flex flex-col items-center justify-center h-20 w-full ${
              plateType === 'both' ? 'bg-red-700' : 'bg-red-400'
            } text-white text-center rounded cursor-pointer transition-colors`}
          >
            <span className="text-xs font-bold">BOTH PLATES</span>
            {plateType === 'both' && (
              <span className="absolute top-0 right-2 text-xs">✓</span>
            )}
          </Label>
        </div>
        
        <div className="relative w-1/3">
          <RadioGroupItem value="front" id={`${idPrefix}front-only`} className="sr-only" />
          <Label 
            htmlFor={`${idPrefix}front-only`} 
            className={`relative flex flex-col items-center justify-center h-20 w-full ${
              plateType === 'front' ? 'bg-red-700' : 'bg-red-400'
            } text-white text-center rounded cursor-pointer transition-colors`}
          >
            <span className="text-xs font-bold">FRONT ONLY</span>
            {plateType === 'front' && (
              <span className="absolute top-0 right-2 text-xs">✓</span>
            )}
          </Label>
        </div>
        
        <div className="relative w-1/3">
          <RadioGroupItem value="rear" id={`${idPrefix}rear-only`} className="sr-only" />
          <Label 
            htmlFor={`${idPrefix}rear-only`} 
            className={`relative flex flex-col items-center justify-center h-20 w-full ${
              plateType === 'rear' ? 'bg-red-700' : 'bg-red-400'
            } text-white text-center rounded cursor-pointer transition-colors`}
          >
            <span className="text-xs font-bold">REAR ONLY</span>
            {plateType === 'rear' && (
              <span className="absolute top-0 right-2 text-xs">✓</span>
            )}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PlateTypeSelector;
