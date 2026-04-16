import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '../components/ui';
import { getGasFreeRecipes } from '../lib/gemini';
import { Recipe } from '../types';
import { motion } from 'motion/react';
import { ChefHat, Loader2, Clock, Utensils } from 'lucide-react';

export const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('Rice, Dal, Potatoes, Onions');
  const [appliances, setAppliances] = useState('Induction Cooktop, Electric Kettle');
  const [dietType, setDietType] = useState('Veg');
  
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await getGasFreeRecipes(ingredients, appliances, dietType);
      setRecipes(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <div className="px-2">
        <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA]">Gas-Free Kitchen</h2>
        <p className="text-muted dark:text-muted mt-3 text-lg">Quick 10-15 minute meals using your available appliances.</p>
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <CardContent className="p-10 bg-bg-card dark:bg-[#242622]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Available Ingredients</label>
              <Input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value as string)}
                placeholder="e.g., Rice, Dal, Potatoes"
                className="h-16 text-lg rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Available Appliances</label>
              <Input
                value={appliances}
                onChange={(e) => setAppliances(e.target.value as string)}
                placeholder="e.g., Induction, Kettle"
                className="h-16 text-lg rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Diet Type</label>
                <Select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  options={[
                    { value: 'Veg', label: 'Vegetarian' },
                    { value: 'Non-Veg', label: 'Non-Vegetarian' },
                    { value: 'Vegan', label: 'Vegan' },
                  ]}
                  className="h-16 text-lg rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="h-16 px-12 rounded-2xl bg-olive-dark text-white font-bold shadow-xl shadow-olive-dark/20 transition-all hover:scale-[1.02] text-lg"
              >
                {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {recipes.map((recipe, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group transition-all duration-300 border-none shadow-xl">
                <div className="p-10 bg-white dark:bg-[#1A1C18] border-b border-sand/10">
                  <div className="flex justify-between items-start gap-6 mb-6">
                    <h3 className="text-2xl font-bold text-ink dark:text-[#E4E3DA] leading-tight group-hover:text-olive-dark dark:group-hover:text-sand transition-colors">{recipe.title}</h3>
                    <span className="px-4 py-1.5 bg-olive-dark/10 text-olive-dark dark:text-sand text-[10px] font-bold rounded-full shadow-sm uppercase tracking-widest border border-sand/10">
                      {recipe.dietType}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px]">
                      <Clock className="h-4 w-4 text-terracotta" /> {recipe.time}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px]">
                      <Utensils className="h-4 w-4 text-olive-dark dark:text-sand" /> {recipe.appliance}
                    </div>
                  </div>
                </div>
                <CardContent className="p-10 flex-1 bg-bg-card dark:bg-[#242622]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white dark:bg-[#1A1C18] rounded-xl flex items-center justify-center border border-sand/10 shadow-sm">
                      <ChefHat className="h-5 w-5 text-olive-dark dark:text-sand" />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-[3px] text-muted dark:text-muted">Instructions</h4>
                  </div>
                  <ol className="space-y-8">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="text-base text-ink/80 dark:text-[#E4E3DA]/80 flex gap-5 font-medium leading-relaxed">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-olive-dark text-white text-[10px] font-bold shadow-sm">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
