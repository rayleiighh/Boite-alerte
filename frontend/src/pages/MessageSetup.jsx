import { useState } from "react";
import { Save, MessageSquare, Clock, Home } from "lucide-react";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { Textarea } from "../components/textarea";
import { Label } from "../components/Label";
import { motion } from "framer-motion";

export function MessageSetup({ currentMessage, onSaveMessage }) {
  const [message, setMessage] = useState(currentMessage || "");
  const [selectedPreset, setSelectedPreset] = useState(null);

  const presetMessages = [
    {
      id: "absent",
      icon: Clock,
      title: "Absent",
      message: "Absent jusqu'à nouvel ordre. Merci de repasser ultérieurement.",
    },
    {
      id: "neighbor",
      icon: Home,
      title: "Déposer chez le voisin",
      message: "Merci de déposer le colis chez le voisin (appartement 12B).",
    },
    {
      id: "instructions",
      icon: MessageSquare,
      title: "Instructions spéciales",
      message:
        "Laisser le courrier dans la boîte principale. Merci de sonner pour les colis.",
    },
    {
      id: "weekend",
      icon: Clock,
      title: "Absent week-end",
      message: "Absent le week-end. Livraison en semaine uniquement.",
    },
  ];

  const handlePresetSelect = (presetMessage, presetId) => {
    setMessage(presetMessage);
    setSelectedPreset(presetId);
  };

  const handleSave = () => {
    onSaveMessage(message);
  };

  const isMessageChanged = message !== currentMessage;

  return (
    <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
          Message pour le facteur
        </h1>
        <p className="text-muted-foreground lg:text-lg">
          Personnalisez les instructions de livraison
        </p>
      </motion.div>

      {/* Current Message Display */}
      {currentMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 border-0 shadow-lg shadow-green-100/50">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-green-800 mb-1">Message actuel</h4>
                <p className="text-green-700">{currentMessage}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Preset Messages */}
      <div>
        <Label className="mb-3 block">Messages prédéfinis</Label>
        <div className="grid gap-3 lg:grid-cols-2">
          {presetMessages.map((preset, index) => {
            const IconComponent = preset.icon;
            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/10 hover:shadow-xl hover:shadow-slate-200/20 ${
                    selectedPreset === preset.id
                      ? "ring-2 ring-blue-500 shadow-blue-200/30"
                      : ""
                  }`}
                  onClick={() => handlePresetSelect(preset.message, preset.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center shadow-md">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{preset.title}</h4>
                      <p className="text-muted-foreground">{preset.message}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom Message */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div>
          <Label htmlFor="custom-message" className="mb-3 block">
            Message personnalisé
          </Label>
          <Textarea
            id="custom-message"
            placeholder="Tapez votre message personnalisé ici..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSelectedPreset(null);
            }}
            className="min-h-24 lg:min-h-32 resize-none"
          />
          <p className="text-muted-foreground mt-2">
            {message.length}/200 caractères
          </p>
        </div>

        <div className="lg:mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-xl border border-blue-100">
            <h4 className="mb-2 text-blue-800">Aperçu</h4>
            <p className="text-blue-700 italic">
              {message || "Votre message apparaîtra ici..."}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="space-y-3">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0"
            disabled={!message.trim() || !isMessageChanged}
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder le message
          </Button>
        </motion.div>

        {!isMessageChanged && message && (
          <p className="text-center text-muted-foreground">
            Message déjà sauvegardé
          </p>
        )}
      </div>
    </div>
  );
}
