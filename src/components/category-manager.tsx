"use client";

import {
  Building2,
  BriefcaseBusiness,
  CarFront,
  Circle,
  Clapperboard,
  Gift,
  HeartPulse,
  House,
  Laptop,
  Receipt,
  ShoppingBag,
  Tag,
  Utensils,
} from "lucide-react";
import { useActionState } from "react";
import type { ComponentType, SVGProps } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { deleteCategory, saveCategory, type CategoryActionState } from "@/app/(app)/categories/actions";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const icons: Record<string, IconComponent> = {
  "utensils": Utensils,
  "car-front": CarFront,
  "shopping-bag": ShoppingBag,
  "house": House,
  "receipt": Receipt,
  "heart-pulse": HeartPulse,
  "clapperboard": Clapperboard,
  "briefcase-business": BriefcaseBusiness,
  "laptop": Laptop,
  "building-2": Building2,
  "gift": Gift,
  "circle": Circle,
  "tag": Tag,
};

const initialState: CategoryActionState = { status: "idle" };

function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, initialState);

  return (
    <form action={action} className="category-form">
      {category && <input name="id" type="hidden" value={category.id} />}
      <label className="field-label">
        Category name
        <input defaultValue={category?.name ?? ""} maxLength={80} minLength={1} name="name" required />
      </label>
      <div className="category-form-row">
        <label className="field-label">
          Type
          <select defaultValue={category?.type ?? "expense"} name="type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="field-label">
          Icon
          <select defaultValue={category?.icon ?? "tag"} name="icon">
            {Object.keys(icons).map((icon) => (
              <option key={icon} value={icon}>{icon.replaceAll("-", " ")}</option>
            ))}
          </select>
        </label>
        <label className="field-label color-field">
          Color
          <input defaultValue={category?.color ?? "#d86749"} name="color" type="color" />
        </label>
      </div>
      {state.message && (
        <p className={state.status === "error" ? "auth-feedback auth-error" : "auth-feedback auth-success"}
          role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <Button disabled={pending} size="sm" type="submit">
        {pending ? "Saving…" : category ? "Save changes" : "Add category"}
      </Button>
    </form>
  );
}

function CategoryItem({ category }: { category: Category }) {
  const [state, action, pending] = useActionState(deleteCategory, initialState);
  const Icon = icons[category.icon] ?? Tag;

  return (
    <article className="category-item">
      <div className="category-identity">
        <span aria-hidden="true" className="category-icon" style={{ color: category.color }}>
          <Icon size={18} />
        </span>
        <span>
          <strong>{category.name}</strong>
          <small>{category.type}</small>
        </span>
      </div>
      <details className="category-edit">
        <summary>Edit</summary>
        <CategoryForm category={category} />
      </details>
      <form action={action} onSubmit={(event) => {
        if (!window.confirm(`Delete ${category.name}?`)) event.preventDefault();
      }}>
        <input name="id" type="hidden" value={category.id} />
        <Button aria-label={`Delete ${category.name}`} disabled={pending} size="sm" type="submit" variant="ghost">
          Delete
        </Button>
        {state.message && (
          <span className={state.status === "error" ? "auth-feedback auth-error" : "auth-feedback auth-success"}
            role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </span>
        )}
      </form>
    </article>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div className="category-manager">
      <section aria-labelledby="new-category-title" className="settings-section">
        <h2 id="new-category-title">Add a category</h2>
        <CategoryForm />
      </section>
      <section aria-labelledby="categories-list-title" className="category-list-section">
        <div className="section-heading">
          <h2 id="categories-list-title">Your categories</h2>
          <span>{categories.length}</span>
        </div>
        {categories.length === 0 ? (
          <p className="empty-list">No categories yet.</p>
        ) : (
          <div className="category-list">
            {categories.map((category) => <CategoryItem category={category} key={category.id} />)}
          </div>
        )}
      </section>
    </div>
  );
}