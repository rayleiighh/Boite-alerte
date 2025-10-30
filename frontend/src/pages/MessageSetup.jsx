import { useState, useEffect } from "react";
import { Save, MessageSquare, Clock, Home, Hash } from "lucide-react";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { Textarea } from "../components/textarea";
import { Label } from "../components/label";
import { motion } from "framer-motion";
import { getDisplayConfig, updateDisplayConfig } from "../services/display.api";

const DEVICE_ID = "esp32-mailbox-001"; // ⚠️ Si vous avez plusieurs ESP32, passez-le en prop

export function MessageSetup() {
  // États
  const [houseNumber, setHouseNumber] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // États initiaux pour détecter les changements
  const [initialHouseNumber, setInitialHouseNumber] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const presetMessages = [
    {
      id: "nopub",
      icon: Home,
      title: "Pas de pub",
      message: "PAS DE PUB",
    },
    {
      id: "absent",
      icon: Clock,
      title: "Absent",
      message: "ABSENT - Repasser SVP",
    },
    {
      id: "neighbor",
      icon: Home,
      title: "Déposer chez le voisin",
      message: "Colis chez voisin 12B",
    },
    {
      id: "instructions",
      icon: MessageSquare,
      title: "Instructions spéciales",
      message: "Sonner pour colis",
    },
  ];

  // Charger la config actuelle au montage
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await getDisplayConfig(DEVICE_ID);
      
      setHouseNumber(config.houseNumber || "");
      setMessage(config.message || "");
      setInitialHouseNumber(config.houseNumber || "");
      setInitialMessage(config.message || "");
    } catch (err) {
      setError("Impossible de charger la configuration : " + err.message);
      console.error("Erreur chargement config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetMessage, presetId) => {
    setMessage(presetMessage);
    setSelectedPreset(presetId);
    setError(null);
    setSuccessMessage("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      // Validation
      if (!houseNumber.trim()) {
        throw new Error("Le numéro de maison est requis");
      }
      if (!message.trim()) {
        throw new Error("Le message est requis");
      }

      // Appel API
      await updateDisplayConfig({
        deviceID: DEVICE_ID,
        houseNumber: houseNumber.trim(),
        message: message.trim(),
      });

      // Mise à jour des états initiaux
      setInitialHouseNumber(houseNumber.trim());
      setInitialMessage(message.trim());

      // Message de succès
      setSuccessMessage("✅ Configuration mise à jour ! L'écran se mettra à jour dans ~30 secondes.");
      
      // Effacer le message après 5 secondes
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde");
      console.error("Erreur sauvegarde:", err);
    } finally {
      setSaving(false);
    }
  };

  const isConfigChanged =
    houseNumber !== initialHouseNumber || message !== initialMessage;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

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
          Configuration de l'affichage
        </h1>
        <p className="text-muted-foreground lg:text-lg">
          Personnalisez le numéro de maison et le message de la boîte
        </p>
      </motion.div>

      {/* Messages d'erreur/succès */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          ❌ {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Current Display Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-0 shadow-xl">
          <div className="text-center space-y-4">
            <p className="text-slate-400 text-sm">Aperçu écran OLED</p>
            <div className="bg-black/50 rounded-lg p-8 border-2 border-blue-500/30">
              <p className="text-white text-6xl font-bold mb-4 tracking-wider">
                {houseNumber || "86B"}
              </p>
              <div className="h-px bg-blue-500/50 mb-4"></div>
              <p className="text-blue-300 text-lg animate-pulse">
                {">>> " + (message || "PAS DE PUB")}
              </p>
            </div>
            <p className="text-slate-400 text-xs">
              Mise à jour automatique toutes les 30 secondes
            </p>
          </div>
        </Card>
      </motion.div>

      {/* House Number Input */}
      <div className="space-y-3">
        <Label htmlFor="house-number" className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-600" />
          Numéro de maison
        </Label>
        <input
          id="house-number"
          type="text"
          placeholder="Ex: 86B"
          value={houseNumber}
          onChange={(e) => {
            const value = e.target.value.slice(0, 10); // Max 10 caractères
            setHouseNumber(value);
            setError(null);
            setSuccessMessage("");
          }}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-2xl font-bold text-center"
          maxLength={10}
        />
        <p className="text-muted-foreground text-sm text-right">
          {houseNumber.length}/10 caractères
        </p>
      </div>

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
                      <h4 className="mb-1 font-semibold">{preset.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {preset.message}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom Message */}
      <div>
        <Label htmlFor="custom-message" className="mb-3 block">
          Message personnalisé
        </Label>
        <Textarea
          id="custom-message"
          placeholder="Ex: PAS DE PUB, SONNER SVP, etc."
          value={message}
          onChange={(e) => {
            const value = e.target.value.slice(0, 100); // Max 100 caractères
            setMessage(value);
            setSelectedPreset(null);
            setError(null);
            setSuccessMessage("");
          }}
          className="min-h-24 lg:min-h-32 resize-none"
          maxLength={100}
        />
        <p className="text-muted-foreground text-sm mt-2">
          {message.length}/100 caractères
        </p>
      </div>

      {/* Save Button */}
      <div className="space-y-3">
        <motion.div
          whileHover={{ scale: isConfigChanged ? 1.02 : 1, y: isConfigChanged ? -2 : 0 }}
          whileTap={{ scale: isConfigChanged ? 0.98 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0"
            disabled={!houseNumber.trim() || !message.trim() || !isConfigChanged || saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la configuration
              </>
            )}
          </Button>
        </motion.div>

        {!isConfigChanged && houseNumber && message && (
          <p className="text-center text-muted-foreground text-sm">
            ✓ Configuration déjà sauvegardée
          </p>
        )}
      </div>
    </div>
  );
}