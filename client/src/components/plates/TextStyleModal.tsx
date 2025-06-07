import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TextStyle } from '@shared/schema';

interface TextStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  textStyles: TextStyle[];
  selectedStyle: TextStyle | null;
  onSelectStyle: (style: TextStyle) => void;
}

const TextStyleModal = ({ isOpen, onClose, textStyles, selectedStyle, onSelectStyle }: TextStyleModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Text Style Preview</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {textStyles.map((style) => (
            <div 
              key={style.id}
              className={`border rounded-lg overflow-hidden ${
                selectedStyle?.id === style.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="bg-gray-100 p-4">
                <h4 className="font-bold mb-2">{style.name}</h4>
                <div className="border border-gray-300 rounded bg-white p-2">
                  {style.imagePath ? (
                    <img 
                      src={style.imagePath} 
                      className="w-full h-32 object-cover" 
                      alt={style.name} 
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                      No preview available
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">{style.description}</p>
                <p className="font-semibold mt-2">
                  {Number(style.additionalPrice) > 0 
                    ? `+£${style.additionalPrice}` 
                    : '£0.00 (Included in base price)'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => onSelectStyle(style)}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextStyleModal;
